"""Shared pieces every route can ask for: the database, the settings, the signed-in user."""

from collections.abc import Iterator

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .db import User
from .security import read_token
from .settings import Settings


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    with request.app.state.sessions() as session:
        yield session


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def not_signed_in() -> HTTPException:
    return HTTPException(status_code=401, detail="Not signed in", headers={"WWW-Authenticate": "Bearer"})


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    scheme, _, token = request.headers.get("authorization", "").partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise not_signed_in()
    payload = read_token(token.strip(), request.app.state.settings.secret_key)
    if not payload:
        raise not_signed_in()
    try:
        user = db.get(User, int(payload["sub"]))
    except (TypeError, ValueError):
        user = None
    if not user or payload.get("tv") != user.token_version:
        raise not_signed_in()
    return user
