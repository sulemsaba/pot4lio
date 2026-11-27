"""Builds the app: settings, database, middleware and every route."""

import secrets

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import sessionmaker

from . import __version__
from .db import Base, User, make_engine
from .images import MAX_BYTES
from .routes import auth, content, media, messages
from .security import RateLimiter, hash_password
from .settings import Settings, load_settings

CONTENT_LIMIT = 5 * 1024 * 1024
MEDIA_LIMIT = MAX_BYTES + 1024 * 1024  # the image, plus room for the form around it
TOO_BIG = "The request is too big"


class BodyLimit:
    """Refuses bodies over the limit: 10 MB for images, 5 MB for everything else."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        limit = MEDIA_LIMIT if scope["path"].startswith("/api/media") else CONTENT_LIMIT
        for name, value in scope["headers"]:
            if name == b"content-length" and value.isdigit() and int(value) > limit:
                await JSONResponse({"detail": TOO_BIG}, status_code=413)(scope, receive, send)
                return
        seen = 0

        async def limited_receive():
            nonlocal seen
            message = await receive()
            if message["type"] == "http.request":
                seen += len(message.get("body", b""))
                if seen > limit:
                    raise HTTPException(status_code=413, detail=TOO_BIG)
            return message

        await self.app(scope, limited_receive, send)


class SecurityHeaders:
    HEADERS = [(b"x-content-type-options", b"nosniff"), (b"referrer-policy", b"no-referrer"), (b"x-frame-options", b"DENY")]

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def with_headers(message):
            if message["type"] == "http.response.start":
                message["headers"] = list(message.get("headers", [])) + self.HEADERS
            await send(message)

        await self.app(scope, receive, with_headers)


def first_admin(sessions, settings: Settings) -> None:
    """Creates the first admin from ADMIN_EMAIL and ADMIN_PASSWORD, once, if nobody exists."""
    if not (settings.admin_email and settings.admin_password):
        return
    with sessions() as db:
        if db.scalar(select(func.count(User.id))):
            return
        if len(settings.admin_password) < 10:
            raise RuntimeError("ADMIN_PASSWORD must have at least 10 characters")
        db.add(User(email=settings.admin_email.strip().lower(), name=settings.admin_name, password_hash=hash_password(settings.admin_password, settings.bcrypt_rounds)))
        db.commit()


def plain_error(exc: RequestValidationError) -> str:
    first = exc.errors()[0] if exc.errors() else {}
    where = ".".join(str(part) for part in first.get("loc", ()) if part not in ("body", "query", "path"))
    message = str(first.get("msg", "Invalid request")).removeprefix("Value error, ")
    return f"{where}: {message}" if where else message


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    settings.check()
    engine = make_engine(settings.database_url)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(engine, expire_on_commit=False)
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    first_admin(sessions, settings)

    app = FastAPI(
        title="Portfolio API",
        version=__version__,
        docs_url="/docs" if settings.is_dev else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.is_dev else None,
    )
    app.state.settings = settings
    app.state.engine = engine
    app.state.sessions = sessions
    app.state.login_limiter = RateLimiter(10, 15 * 60)
    app.state.message_limiter = RateLimiter(5, 60 * 60)
    app.state.dummy_hash = hash_password(secrets.token_urlsafe(16), settings.bcrypt_rounds)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": plain_error(exc)})

    @app.get("/api/health")
    def health():
        return {"ok": True, "version": __version__}

    @app.get("/", include_in_schema=False)
    def home():
        return {"ok": True, "name": "Portfolio API", "version": __version__, "health": "/api/health"}

    app.include_router(content.router)
    app.include_router(auth.router)
    app.include_router(media.router)
    app.include_router(messages.router)

    # The last one added runs first: CORS wraps everything, so even a refusal carries its headers.
    app.add_middleware(BodyLimit)
    app.add_middleware(SecurityHeaders)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "If-None-Match"],
        expose_headers=["ETag"],
        max_age=600,
    )
    return app
