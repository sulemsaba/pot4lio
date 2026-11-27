import io
import json
from pathlib import Path

import pytest
from PIL import Image

from app import cli
from app.settings import DEV_SECRET, Settings, load_settings, normalize_database_url

from .conftest import OWNER, SITE

FIXTURES = Path(__file__).parent / "fixtures"


def png(width, height, mode="RGB"):
    out = io.BytesIO()
    Image.new(mode, (width, height), (5, 161, 242) if mode == "RGB" else (5, 161, 242, 128)).save(out, format="PNG")
    return out.getvalue()


# ---------- health and sign in ----------


def test_health(client):
    assert client.get("/api/health").json() == {"ok": True, "version": "1.0.0"}


@pytest.mark.parametrize(
    "method,path",
    [
        ("put", "/api/content"),
        ("get", "/api/versions"),
        ("get", "/api/versions/1"),
        ("post", "/api/versions/1/restore"),
        ("get", "/api/auth/me"),
        ("post", "/api/auth/password"),
        ("get", "/api/media"),
        ("post", "/api/media"),
        ("delete", "/api/media/work/x.webp"),
        ("get", "/api/messages"),
        ("patch", "/api/messages/1"),
        ("delete", "/api/messages/1"),
    ],
)
def test_private_endpoints_need_sign_in(client, method, path):
    for headers in ({}, {"Authorization": "Bearer not-a-token"}, {"Authorization": "Basic abc"}):
        response = client.request(method, path, headers=headers, json={"read": True, "collections": {"profile": {}}})
        assert response.status_code == 401, (method, path, response.text)
        assert response.json() == {"detail": "Not signed in"}


def test_login(client):
    response = client.post("/api/auth/login", json={"email": " Owner@Example.com ", "password": OWNER["password"]})
    assert response.status_code == 200
    body = response.json()
    assert body["user"] == {"email": "owner@example.com", "name": "Owner"}
    assert body["token"] and body["expiresAt"].endswith("Z")
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['token']}"})
    assert me.json() == {"email": "owner@example.com", "name": "Owner"}

    assert client.post("/api/auth/login", json={**OWNER, "password": "wrong password!"}).status_code == 401
    unknown = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "whatever123"})
    assert unknown.status_code == 401 and unknown.json() == {"detail": "Wrong email or password"}


def test_login_rate_limit(client):
    for _ in range(10):
        assert client.post("/api/auth/login", json={**OWNER, "password": "wrong password!"}).status_code == 401
    response = client.post("/api/auth/login", json=OWNER)
    assert response.status_code == 429
    assert isinstance(response.json()["detail"], str)


def test_password_change(client, auth):
    assert client.post("/api/auth/password", headers=auth, json={"current": "nope", "next": "a new long password"}).status_code == 400
    short = client.post("/api/auth/password", headers=auth, json={"current": OWNER["password"], "next": "short"})
    assert short.status_code == 422 and isinstance(short.json()["detail"], str)
    assert client.post("/api/auth/password", headers=auth, json={"current": OWNER["password"], "next": "a new long password"}).status_code == 204
    assert client.get("/api/auth/me", headers=auth).status_code == 401  # older sign-ins stop working
    assert client.post("/api/auth/login", json=OWNER).status_code == 401
    assert client.post("/api/auth/login", json={"email": OWNER["email"], "password": "a new long password"}).status_code == 200


# ---------- content ----------


def test_content_flow(client, auth):
    empty = client.get("/api/content")
    assert empty.status_code == 200
    assert empty.json() == {"version": 0, "updatedAt": None, "collections": {}}
    assert empty.headers["etag"] == 'W/"v0"'
    assert empty.headers["cache-control"] == "no-cache"

    profile = {"name": "Suleiman Msaba", "note": "Habari’za “leo”"}
    saved = client.put("/api/content", headers=auth, json={"baseVersion": 0, "message": "First", "collections": {"profile": profile}})
    assert saved.status_code == 200, saved.text
    assert saved.json()["version"] == 1 and saved.json()["updatedAt"].endswith("Z")

    current = client.get("/api/content")
    assert current.json()["collections"] == {"profile": profile}
    assert current.headers["etag"] == 'W/"v1"'
    assert "’" in current.text  # stored and sent as real characters

    assert client.get("/api/content", headers={"If-None-Match": 'W/"v1"'}).status_code == 304
    assert client.get("/api/content", headers={"If-None-Match": 'W/"v0"'}).status_code == 200

    stale = client.put("/api/content", headers=auth, json={"baseVersion": 0, "collections": {"profile": {"name": "x"}}})
    assert stale.status_code == 409
    assert stale.json()["version"] == 1 and isinstance(stale.json()["detail"], str)
    assert client.get("/api/content").json()["collections"]["profile"] == profile  # nothing saved

    unknown = client.put("/api/content", headers=auth, json={"collections": {"profile": {}, "secrets": {}}})
    assert unknown.status_code == 422
    assert "Unknown collection: secrets" in unknown.json()["detail"]
    assert client.put("/api/content", headers=auth, json={"collections": {}}).status_code == 422

    # Only the collections sent are replaced; without baseVersion there is no check.
    projects = [{"id": "ligiplay", "name": "LigiPlay"}]
    assert client.put("/api/content", headers=auth, json={"collections": {"projects": projects}}).json()["version"] == 2
    assert client.get("/api/content").json()["collections"] == {"profile": profile, "projects": projects}


def test_content_body_limit(client, auth):
    big = {"collections": {"essays": ["x" * (5 * 1024 * 1024)]}}
    assert client.put("/api/content", headers=auth, json=big).status_code == 413

    def chunks():  # no Content-Length: the limit is counted while reading
        yield b'{"collections": {"essays": ["'
        for _ in range(6):
            yield b"x" * (1024 * 1024)
        yield b'"]}}'

    response = client.put("/api/content", headers={**auth, "Content-Type": "application/json"}, content=chunks())
    assert response.status_code == 413
    assert response.json() == {"detail": "The request is too big"}


def test_versions(client, auth):
    client.put("/api/content", headers=auth, json={"message": "One", "collections": {"profile": {"name": "A"}}})
    client.put("/api/content", headers=auth, json={"message": "Two", "collections": {"profile": {"name": "B"}, "words": []}})

    listed = client.get("/api/versions", headers=auth).json()
    assert [v["version"] for v in listed] == [2, 1]
    assert listed[0]["keys"] == ["profile", "words"] and listed[0]["message"] == "Two" and listed[0]["by"] == OWNER["email"]
    assert set(listed[0]) == {"id", "version", "createdAt", "message", "keys", "by"}

    first = client.get(f"/api/versions/{listed[1]['id']}", headers=auth).json()
    assert first["collections"] == {"profile": {"name": "A"}}
    assert client.get("/api/versions/999", headers=auth).status_code == 404

    restored = client.post(f"/api/versions/{listed[1]['id']}/restore", headers=auth)
    assert restored.status_code == 200 and restored.json()["version"] == 3
    now = client.get("/api/content").json()
    assert now["version"] == 3 and now["collections"]["profile"] == {"name": "A"}
    assert client.get("/api/versions", headers=auth).json()[0]["message"] == "Restored version 1"


# ---------- images ----------


def test_media(client, auth, settings):
    upload = client.post("/api/media", headers=auth, data={"folder": "work"}, files={"file": ("LEVO Home page.png", png(3000, 1000), "image/png")})
    assert upload.status_code == 201, upload.text
    item = upload.json()
    assert item["w"] == 2400 and item["h"] == 800
    assert item["path"].startswith("work/levo-home-page-") and item["path"].endswith(".webp")
    assert item["url"] == f"http://testserver/media/{item['path']}"
    assert item["size"] == (settings.media_dir / item["path"]).stat().st_size

    served = client.get(f"/media/{item['path']}")
    assert served.status_code == 200 and served.headers["content-type"] == "image/webp"
    assert "immutable" in served.headers["cache-control"]
    assert Image.open(io.BytesIO(served.content)).format == "WEBP"

    listed = client.get("/api/media", headers=auth).json()
    assert [m["path"] for m in listed] == [item["path"]] and listed[0]["createdAt"].endswith("Z")

    assert client.delete(f"/api/media/{item['path']}", headers=auth).status_code == 204
    assert client.get(f"/media/{item['path']}").status_code == 404
    assert client.delete(f"/api/media/{item['path']}", headers=auth).status_code == 404
    assert client.get("/api/media", headers=auth).json() == []


def test_media_keeps_transparency_and_drops_metadata(client, auth):
    transparent = client.post("/api/media", headers=auth, files={"file": ("logo.png", png(40, 40, "RGBA"), "image/png")}).json()
    assert transparent["path"].startswith("uploads/logo-")
    assert Image.open(io.BytesIO(client.get(f"/media/{transparent['path']}").content)).mode == "RGBA"

    exif = Image.Exif()
    exif[0x010F] = "Camera maker"  # Make
    exif[0x0112] = 6  # Orientation: turned on its side
    photo = io.BytesIO()
    Image.new("RGB", (300, 100), "red").save(photo, format="JPEG", exif=exif.tobytes())
    item = client.post("/api/media", headers=auth, files={"file": ("photo.jpg", photo.getvalue(), "image/jpeg")}).json()
    assert (item["w"], item["h"]) == (100, 300)  # stood upright
    saved = Image.open(io.BytesIO(client.get(f"/media/{item['path']}").content))
    assert not saved.info.get("exif") and not saved.getexif()


def test_media_refuses_what_is_not_an_image(client, auth):
    for name, data in [("notes.txt", b"hello"), ("x.svg", b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), ("broken.png", png(10, 10)[:30])]:
        response = client.post("/api/media", headers=auth, files={"file": (name, data, "image/png")})
        assert response.status_code == 422, name
        assert isinstance(response.json()["detail"], str)
    bad_folder = client.post("/api/media", headers=auth, data={"folder": "../app"}, files={"file": ("a.png", png(10, 10), "image/png")})
    assert bad_folder.status_code == 422
    assert client.get("/api/media", headers=auth).json() == []


def test_media_paths_cannot_escape(client, auth, settings):
    secret = settings.media_dir.parent / "secret.txt"
    secret.write_text("private")
    for path in ["/media/..%2Fsecret.txt", "/media/%2E%2E/secret.txt", "/media/work/..%2F..%2Fsecret.txt"]:
        assert client.get(path).status_code == 404, path
        assert client.delete("/api" + path, headers=auth).status_code == 404, path
    assert secret.read_text() == "private"


def test_media_size_limit(client, auth):
    huge = b"\x89PNG" + b"0" * (11 * 1024 * 1024)
    assert client.post("/api/media", headers=auth, files={"file": ("big.png", huge, "image/png")}).status_code == 413


# ---------- messages ----------


def test_messages(client, auth):
    sent = client.post("/api/messages", json={"name": "Amina", "email": "amina@example.com", "subject": "A website", "message": "  I need a shop website.  ", "page": "contact", "website": ""})
    assert sent.status_code == 201 and sent.json() == {"ok": True}
    assert client.post("/api/messages", json={"message": "only the message, other fields null", "name": None, "page": None}).status_code == 201

    blank = client.post("/api/messages", json={"message": "   "})
    assert blank.status_code == 422 and isinstance(blank.json()["detail"], str)
    assert client.post("/api/messages", json={"message": "x" * 5001}).status_code == 422

    trap = client.post("/api/messages", json={"message": "Buy cheap things", "website": "http://spam.example"})
    assert trap.status_code == 201 and trap.json() == {"ok": True}

    listed = client.get("/api/messages", headers=auth).json()
    assert len(listed) == 2  # the trapped one was dropped
    newest = listed[1] if listed[1]["name"] == "Amina" else listed[0]
    assert newest["message"] == "I need a shop website." and newest["read"] is False
    assert set(newest) == {"id", "name", "email", "phone", "subject", "message", "page", "createdAt", "read"}

    marked = client.patch(f"/api/messages/{newest['id']}", headers=auth, json={"read": True})
    assert marked.status_code == 200 and marked.json()["read"] is True
    unread = client.get("/api/messages?status=unread", headers=auth).json()
    assert [m["id"] for m in unread] == [m["id"] for m in listed if m["id"] != newest["id"]]
    assert client.get("/api/messages?status=nope", headers=auth).status_code == 422

    assert client.delete(f"/api/messages/{newest['id']}", headers=auth).status_code == 204
    assert client.patch(f"/api/messages/{newest['id']}", headers=auth, json={"read": False}).status_code == 404
    assert client.delete(f"/api/messages/{newest['id']}", headers=auth).status_code == 404
    assert len(client.get("/api/messages", headers=auth).json()) == 1


def test_message_rate_limit(client):
    for number in range(5):
        assert client.post("/api/messages", json={"message": f"hello {number}"}).status_code == 201
    response = client.post("/api/messages", json={"message": "one more"})
    assert response.status_code == 429 and isinstance(response.json()["detail"], str)


# ---------- CORS and headers ----------


def test_cors(client):
    allowed = client.get("/api/content", headers={"Origin": SITE})
    assert allowed.headers["access-control-allow-origin"] == SITE
    assert "etag" in allowed.headers["access-control-expose-headers"].lower()
    assert allowed.headers["x-content-type-options"] == "nosniff"

    preflight = client.options("/api/content", headers={"Origin": SITE, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "authorization,content-type"})
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == SITE
    assert "PUT" in preflight.headers["access-control-allow-methods"]

    other = client.get("/api/content", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in other.headers

    too_big = client.put("/api/content", headers={"Origin": SITE, "Content-Length": str(6 * 1024 * 1024)}, content=b"x")
    assert too_big.status_code == 413 and too_big.headers["access-control-allow-origin"] == SITE


# ---------- terminal jobs and settings ----------


def test_cli_seed_and_export(settings, tmp_path, monkeypatch, client, capsys):
    assert cli.main(["seed", str(FIXTURES)], settings=settings) == 0
    content = client.get("/api/content").json()
    assert content["version"] == 1
    assert set(content["collections"]) == {"profile", "projects"}
    assert client.get("/api/versions", headers=client_auth(client)).json()[0]["message"] == "Seeded from files"

    out = tmp_path / "out"
    assert cli.main(["export", str(out)], settings=settings) == 0
    for name in ("profile.json", "projects.json"):
        assert (out / name).read_bytes() == (FIXTURES / name).read_bytes()  # same format as the repo files

    assert cli.main(["seed", str(tmp_path / "empty")], settings=settings) == 1

    answers = iter(["another long password", "another long password"])
    monkeypatch.setattr(cli.getpass, "getpass", lambda prompt="": next(answers))
    assert cli.main(["create-admin", "--email", "Second@Example.com", "--name", "Second"], settings=settings) == 0
    assert client.post("/api/auth/login", json={"email": "second@example.com", "password": "another long password"}).status_code == 200
    capsys.readouterr()


def client_auth(client):
    return {"Authorization": f"Bearer {client.post('/api/auth/login', json=OWNER).json()['token']}"}


def test_settings(monkeypatch):
    with pytest.raises(RuntimeError):
        Settings(env="production", secret_key=DEV_SECRET).check()
    with pytest.raises(RuntimeError):
        Settings(env="production", secret_key="short").check()
    Settings(env="production", secret_key="s" * 40).check()

    for name in ("ENV", "SECRET_KEY", "ALLOWED_ORIGINS"):
        monkeypatch.delenv(name, raising=False)
    with pytest.raises(RuntimeError):
        load_settings(env_file=False)  # production is the default, and it needs a secret
    monkeypatch.setenv("ENV", "development")
    dev = load_settings(env_file=False)
    assert dev.secret_key == DEV_SECRET and "http://localhost:3000" in dev.allowed_origins
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("SECRET_KEY", "k" * 40)
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://sulemsaba.github.io/, http://localhost:3000")
    live = load_settings(env_file=False)
    assert live.allowed_origins == ["https://sulemsaba.github.io", "http://localhost:3000"]

    assert normalize_database_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_database_url("postgresql://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_database_url("sqlite:///./data/x.db").endswith("/server/data/x.db")
    assert json.loads(json.dumps({"ok": True}))
