"""Settings, read from the environment and from server/.env when that file exists.

A value already set in the environment always wins over the .env file.
"""

import os
from dataclasses import dataclass, field
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parent.parent

# The content collections, one per file in the website's src/data/ folder.
KEYS = (
    "profile",
    "copy",
    "words",
    "projects",
    "experience",
    "skills",
    "education",
    "certificates",
    "cv",
    "essays",
    "tools",
)

DEV_SECRET = "dev-only-secret-do-not-use-in-production"
DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:4173", "http://127.0.0.1:4173"]
LIVE_ORIGINS = ["https://sulemsaba.github.io"]


def read_env_file(path: Path) -> None:
    """Load KEY=value lines into the environment, without overriding what is set."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip().removeprefix("export ").strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        os.environ.setdefault(key, value)


def normalize_database_url(url: str) -> str:
    """Accept the postgres:// form hosts like Render and Railway hand out."""
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    if url.startswith("sqlite:///") and not url.startswith("sqlite:////"):
        # A relative SQLite path is relative to the server folder, wherever it is started from.
        relative = url[len("sqlite:///"):]
        if relative and relative != ":memory:":
            return "sqlite:///" + str((SERVER_DIR / relative).resolve())
    return url


@dataclass
class Settings:
    env: str = "development"
    database_url: str = "sqlite:///./data/portfolio.db"
    secret_key: str = DEV_SECRET
    allowed_origins: list[str] = field(default_factory=lambda: list(DEV_ORIGINS))
    public_url: str = ""
    media_dir: Path = Path("./data/media")
    token_hours: float = 12
    admin_email: str = ""
    admin_password: str = ""
    admin_name: str = ""
    bcrypt_rounds: int = 12

    def __post_init__(self) -> None:
        self.env = self.env.strip().lower()
        self.database_url = normalize_database_url(self.database_url)
        self.media_dir = Path(self.media_dir)
        if not self.media_dir.is_absolute():
            self.media_dir = (SERVER_DIR / self.media_dir).resolve()
        self.public_url = self.public_url.strip().rstrip("/")
        self.allowed_origins = [o.strip().rstrip("/") for o in self.allowed_origins if o.strip()]

    @property
    def is_dev(self) -> bool:
        return self.env == "development"

    def check(self) -> None:
        if self.is_dev:
            return
        if not self.secret_key or self.secret_key == DEV_SECRET or len(self.secret_key) < 32:
            raise RuntimeError(
                "SECRET_KEY must be a long random value (32 characters or more) outside development. "
                'Make one with: python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )


def load_settings(env_file: bool = True) -> Settings:
    if env_file:
        read_env_file(SERVER_DIR / ".env")
    env = (os.getenv("ENV") or "production").strip().lower()
    dev = env == "development"
    secret = os.getenv("SECRET_KEY", "").strip() or (DEV_SECRET if dev else "")
    origins = os.getenv("ALLOWED_ORIGINS")
    settings = Settings(
        env=env,
        database_url=os.getenv("DATABASE_URL") or "sqlite:///./data/portfolio.db",
        secret_key=secret,
        allowed_origins=origins.split(",") if origins is not None else list(DEV_ORIGINS if dev else LIVE_ORIGINS),
        public_url=os.getenv("PUBLIC_URL", ""),
        media_dir=Path(os.getenv("MEDIA_DIR") or "./data/media"),
        token_hours=float(os.getenv("TOKEN_HOURS") or "12"),
        admin_email=os.getenv("ADMIN_EMAIL", "").strip().lower(),
        admin_password=os.getenv("ADMIN_PASSWORD", ""),
        admin_name=os.getenv("ADMIN_NAME", "").strip(),
        bcrypt_rounds=int(os.getenv("BCRYPT_ROUNDS") or "12"),
    )
    settings.check()
    return settings
