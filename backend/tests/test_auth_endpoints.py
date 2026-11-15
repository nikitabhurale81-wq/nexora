"""Auth endpoint tests via the ASGI client (DB overridden to SQLite)."""

from __future__ import annotations

import uuid

from app.core.permissions import get_optional_user
from app.main import app
from app.models.user import User


async def test_me_requires_authentication(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["success"] is False


async def test_guest_token_then_me(client):
    created = await client.post("/api/v1/auth/guest")
    assert created.status_code == 200
    token = created.json()["data"]["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["data"]["role"] == "guest"


async def test_guest_blocked_from_registered_endpoint(client):
    token = (await client.post("/api/v1/auth/guest")).json()["data"]["access_token"]
    resp = await client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403


async def test_registered_user_profile_via_override(client):
    fake = User(
        id=uuid.uuid4(), email="reg@example.com", name="Reg User",
        role="user", subscription="pro", is_active=True,
    )

    async def _fake_optional_user():
        return fake

    app.dependency_overrides[get_optional_user] = _fake_optional_user
    try:
        resp = await client.get("/api/v1/users/me")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["email"] == "reg@example.com"
        assert data["subscription"] == "pro"
    finally:
        app.dependency_overrides.pop(get_optional_user, None)
