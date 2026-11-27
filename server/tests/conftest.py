import pytest
from fastapi.testclient import TestClient

from app.api import create_app
from app.settings import Settings

OWNER = {"email": "owner@example.com", "password": "correct horse battery"}
SITE = "https://sulemsaba.github.io"


@pytest.fixture
def settings(tmp_path):
    return Settings(
        env="development",
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        secret_key="t" * 48,
        allowed_origins=[SITE],
        media_dir=tmp_path / "media",
        admin_email=OWNER["email"],
        admin_password=OWNER["password"],
        admin_name="Owner",
        bcrypt_rounds=4,
    )


@pytest.fixture
def client(settings):
    with TestClient(create_app(settings)) as test_client:
        yield test_client


@pytest.fixture
def auth(client):
    response = client.post("/api/auth/login", json=OWNER)
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}
