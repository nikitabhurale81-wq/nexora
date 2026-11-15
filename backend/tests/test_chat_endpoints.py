"""Chat endpoint tests via the ASGI client (mocked provider, SQLite DB)."""

from __future__ import annotations

import uuid

import pytest

from app.core.permissions import get_current_user, require_registered_user
from app.integrations.ai_providers.mock import MockProvider
from app.main import app
from app.models.user import User
from app.services.chat import service as chat


@pytest.fixture(autouse=True)
def _mock_provider(monkeypatch):
    monkeypatch.setattr(chat, "get_ai_provider", lambda: MockProvider())


def _registered() -> User:
    return User(id=uuid.uuid4(), email="reg@ex.com", role="user", subscription="free", is_active=True)


def _guest() -> User:
    return User(id=uuid.uuid4(), email=None, role="guest", subscription="free", is_active=True)


async def test_message_requires_auth(client):
    resp = await client.post("/api/v1/chat/message", json={"content": "hi"})
    assert resp.status_code == 401


async def test_registered_message_flow(client):
    user = _registered()
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[require_registered_user] = lambda: user
    try:
        send = await client.post("/api/v1/chat/message", json={"content": "Hello"})
        assert send.status_code == 200
        data = send.json()["data"]
        assert data["guest"] is False
        assert data["conversation_id"]

        convs = await client.get("/api/v1/conversations")
        assert convs.status_code == 200
        assert len(convs.json()["data"]) == 1
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(require_registered_user, None)


async def test_guest_message_not_persisted(client):
    guest = _guest()
    app.dependency_overrides[get_current_user] = lambda: guest
    try:
        resp = await client.post("/api/v1/chat/message", json={"content": "Hi there"})
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["guest"] is True
        assert data["conversation_id"] is None
    finally:
        app.dependency_overrides.pop(get_current_user, None)


async def test_stream_endpoint_emits_sse(client):
    user = _registered()
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        resp = await client.post("/api/v1/chat/stream", json={"content": "stream"})
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        assert "data:" in resp.text
        assert '"type": "done"' in resp.text
    finally:
        app.dependency_overrides.pop(get_current_user, None)
