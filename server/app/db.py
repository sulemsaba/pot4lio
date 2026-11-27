"""Database tables and the connection. SQLite by default, PostgreSQL via DATABASE_URL."""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text, create_engine, event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

Json = JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    """Now in UTC, without a time zone attached (stored that way in every database)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def iso(moment: datetime | None) -> str | None:
    return moment.replace(microsecond=0).isoformat() + "Z" if moment else None


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    password_hash: Mapped[str] = mapped_column(String(100))
    # Goes up when the password changes, so every older sign-in stops working.
    token_version: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Collection(Base):
    """The current value of one content collection (one src/data/<key>.json file)."""

    __tablename__ = "collections"

    key: Mapped[str] = mapped_column(String(40), primary_key=True)
    data: Mapped[Any] = mapped_column(Json)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Version(Base):
    """One save: what changed, who saved it, and the whole content right after it."""

    __tablename__ = "versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    version: Mapped[int] = mapped_column(Integer, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    message: Mapped[str] = mapped_column(String(500), default="")
    keys: Mapped[Any] = mapped_column(Json)
    by: Mapped[str] = mapped_column("author", String(200), default="")
    snapshot: Mapped[Any] = mapped_column(Json)


class Message(Base):
    """A message sent from the website's contact form."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text)
    page: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    read: Mapped[bool] = mapped_column("is_read", Boolean, default=False)


class Media(Base):
    """An uploaded image, saved under MEDIA_DIR at `path`."""

    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(String(300), unique=True)
    w: Mapped[int] = mapped_column(Integer)
    h: Mapped[int] = mapped_column(Integer)
    size: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


def make_engine(url: str) -> Engine:
    if url.startswith("sqlite"):
        database = make_url(url).database
        if database and database != ":memory:":
            Path(database).parent.mkdir(parents=True, exist_ok=True)
        engine = create_engine(url, connect_args={"check_same_thread": False})

        @event.listens_for(engine, "connect")
        def _sqlite_pragmas(connection, _record):
            cursor = connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

        return engine
    return create_engine(url, pool_pre_ping=True)
