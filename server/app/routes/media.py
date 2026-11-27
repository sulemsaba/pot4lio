"""Uploading, listing, deleting and serving images."""

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import Media, User, iso
from ..deps import current_user, get_db
from ..images import FOLDERS, MAX_BYTES, NotAnImage, new_path, safe_file, to_webp

router = APIRouter()


def base_url(request: Request) -> str:
    return request.app.state.settings.public_url or str(request.base_url).rstrip("/")


def media_out(request: Request, row: Media) -> dict:
    return {"url": f"{base_url(request)}/media/{row.path}", "path": row.path, "w": row.w, "h": row.h, "size": row.size, "createdAt": iso(row.created_at)}


@router.post("/api/media", status_code=201)
async def upload(
    request: Request,
    file: UploadFile = File(...),
    folder: str = Form("uploads"),
    _: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if folder not in FOLDERS:
        raise HTTPException(status_code=422, detail="folder must be one of: " + ", ".join(FOLDERS))
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="The image is bigger than 10 MB")
    try:
        webp, w, h = await run_in_threadpool(to_webp, data)
    except NotAnImage:
        raise HTTPException(status_code=422, detail="That file is not an image the server can read") from None
    media_dir = request.app.state.settings.media_dir
    path = new_path(media_dir, folder, file.filename)
    target = media_dir / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(webp)
    row = Media(path=path, w=w, h=h, size=len(webp))
    db.add(row)
    db.commit()
    return media_out(request, row)


@router.get("/api/media")
def list_media(request: Request, _: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Media).order_by(Media.created_at.desc(), Media.id.desc()))
    return [media_out(request, row) for row in rows]


@router.delete("/api/media/{path:path}", status_code=204)
def delete_media(path: str, request: Request, _: User = Depends(current_user), db: Session = Depends(get_db)):
    target = safe_file(request.app.state.settings.media_dir, path)
    row = db.scalar(select(Media).where(Media.path == path))
    if target is None or (row is None and not target.is_file()):
        raise HTTPException(status_code=404, detail="There is no such image")
    if target.is_file():
        target.unlink()
    if row is not None:
        db.delete(row)
        db.commit()
    return Response(status_code=204)


@router.get("/media/{path:path}")
def media_file(path: str, request: Request):
    target = safe_file(request.app.state.settings.media_dir, path)
    if target is None or not target.is_file():
        raise HTTPException(status_code=404, detail="There is no such image")
    # Names never repeat, so a browser may keep a file forever.
    return FileResponse(target, media_type="image/webp", headers={"Cache-Control": "public, max-age=31536000, immutable"})
