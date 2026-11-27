"""Reading and saving the content. Every save is a new numbered version with a full snapshot."""

from datetime import datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .db import Collection, Version, utcnow


class Conflict(Exception):
    """The content changed since the caller loaded it."""

    def __init__(self, version: int):
        super().__init__(version)
        self.version = version


def current_version(db: Session) -> tuple[int, datetime | None]:
    latest = db.scalar(select(Version).order_by(Version.version.desc()).limit(1))
    return (latest.version, latest.created_at) if latest else (0, None)


def read_content(db: Session) -> tuple[int, datetime | None, dict[str, Any]]:
    version, updated = current_version(db)
    collections = {row.key: row.data for row in db.scalars(select(Collection).order_by(Collection.key))}
    return version, updated, collections


def save_content(
    db: Session,
    changes: dict[str, Any],
    base_version: int | None,
    message: str,
    by: str,
) -> tuple[int, datetime]:
    """Replace the given collections and record the result as the next version."""
    current = db.scalar(select(func.max(Version.version))) or 0
    if base_version is not None and base_version != current:
        raise Conflict(current)
    now = utcnow()
    rows = {row.key: row for row in db.scalars(select(Collection))}
    for key, value in changes.items():
        row = rows.get(key)
        if row is None:
            row = rows[key] = Collection(key=key)
            db.add(row)
        row.data = value
        row.updated_at = now
    snapshot = {key: (changes[key] if key in changes else row.data) for key, row in sorted(rows.items())}
    db.add(Version(version=current + 1, created_at=now, message=message[:500], keys=sorted(changes), by=by, snapshot=snapshot))
    try:
        db.commit()
    except IntegrityError:
        # Another save took the same version number at the same moment.
        db.rollback()
        raise Conflict(db.scalar(select(func.max(Version.version))) or 0) from None
    return current + 1, now
