"""Passwords, sign-in tokens and simple per-address rate limits."""

import base64
import hashlib
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt


def _prepare(password: str) -> bytes:
    # bcrypt reads at most 72 bytes, so long passwords are hashed down first.
    return base64.b64encode(hashlib.sha256(password.encode("utf-8")).digest())


def hash_password(password: str, rounds: int = 12) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt(rounds)).decode("ascii")


def verify_password(password: str, hashed: str) -> bool:
    """Constant-time check (bcrypt compares in constant time)."""
    try:
        return bcrypt.checkpw(_prepare(password), hashed.encode("ascii"))
    except ValueError:
        return False


def make_token(user_id: int, token_version: int, secret: str, hours: float) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=hours)
    payload = {"sub": str(user_id), "tv": token_version, "iat": int(now.timestamp()), "exp": int(expires.timestamp())}
    return jwt.encode(payload, secret, algorithm="HS256"), expires.replace(tzinfo=None)


def read_token(token: str, secret: str) -> dict | None:
    try:
        return jwt.decode(token, secret, algorithms=["HS256"], options={"require": ["exp", "sub"]})
    except jwt.PyJWTError:
        return None


class RateLimiter:
    """At most `limit` hits per `window` seconds for each key (an IP address)."""

    def __init__(self, limit: int, window: float):
        self.limit = limit
        self.window = window
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                return False
            hits.append(now)
            if len(self._hits) > 10000:  # forget quiet addresses now and then
                for stale in [k for k, q in self._hits.items() if not q or q[-1] <= now - self.window]:
                    del self._hits[stale]
            return True
