"""GET and PUT the content, and the history of saves."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..content import Conflict, read_content, save_content
from ..db import User, Version, iso
from ..deps import current_user, get_db
from ..settings import KEYS

router = APIRouter(prefix="/api")

CONFLICT = "The content changed since you loaded it, maybe from another device. Reload it, then save again."


class ContentIn(BaseModel):
    baseVersion: int | None = None
    message: str | None = Field(default=None, max_length=500)
    collections: dict[str, Any]

    @field_validator("collections")
    @classmethod
    def known_keys(cls, value: dict[str, Any]) -> dict[str, Any]:
        unknown = sorted(set(value) - set(KEYS))
        if unknown:
            raise ValueError("Unknown collection: " + ", ".join(unknown))
        if not value:
            raise ValueError("Nothing to save")
        return value


def saved(version: int, updated) -> dict:
    return {"version": version, "updatedAt": iso(updated)}


def conflict(error: Conflict) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": CONFLICT, "version": error.version})


@router.get("/content")
def get_content(request: Request, db: Session = Depends(get_db)):
    version, updated, collections = read_content(db)
    etag = f'W/"v{version}"'
    headers = {"ETag": etag, "Cache-Control": "no-cache"}
    asked = request.headers.get("if-none-match", "")
    if asked and (asked.strip() == "*" or etag in [tag.strip() for tag in asked.split(",")]):
        return Response(status_code=304, headers=headers)
    return JSONResponse({"version": version, "updatedAt": iso(updated), "collections": collections}, headers=headers)


@router.put("/content")
def put_content(body: ContentIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        version, updated = save_content(db, body.collections, body.baseVersion, (body.message or "").strip(), user.email)
    except Conflict as error:
        return conflict(error)
    return saved(version, updated)


def version_out(row: Version) -> dict:
    return {"id": row.id, "version": row.version, "createdAt": iso(row.created_at), "message": row.message, "keys": row.keys, "by": row.by}


@router.get("/versions")
def list_versions(_: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Version).order_by(Version.version.desc()).limit(50))
    return [version_out(row) for row in rows]


def find_version(db: Session, version_id: int) -> Version:
    row = db.get(Version, version_id)
    if not row:
        raise HTTPException(status_code=404, detail="There is no such version")
    return row


@router.get("/versions/{version_id}")
def get_version(version_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    row = find_version(db, version_id)
    return {**version_out(row), "collections": row.snapshot}


@router.post("/versions/{version_id}/restore")
def restore_version(version_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = find_version(db, version_id)
    try:
        version, updated = save_content(db, dict(row.snapshot), None, f"Restored version {row.version}", user.email)
    except Conflict as error:
        return conflict(error)
    return saved(version, updated)
