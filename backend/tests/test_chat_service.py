"""Chat service tests with a mocked AI provider and in-memory DB."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, QuotaExceededError, ServiceUnavailableError
from app.integrations.ai_providers.mock import MockProvider
from app.models.user import User
from app.services.chat import service as chat
from app.services.usage import service as usage


async def _make_user(db, role="user", plan="free") -> User:
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role=role, subscription=plan, is_active=True)
    db.add(u)
    await db.flush()
    return u


@pytest.fixture(autouse=True)
def _mock_provider(monkeypatch):
    monkeypatch.setattr(chat, "get_ai_provider", lambda: MockProvider())


async def test_send_message_persists_conversation_and_messages(db_session):
    user = await _make_user(db_session)
    result = await chat.send_message(db_session, user, content="Hello NEXORA")
    assert result["guest"] is False
    assert result["content"].startswith("[mock reply]")

    convs = await chat.list_conversations(db_session, user)
    assert len(convs) == 1
    msgs = await chat.list_messages(db_session, user, convs[0].id)
    assert [m.role for m in msgs] == ["user", "assistant"]
    # Conversation auto-titled from the first user message.
    assert convs[0].title == "Hello NEXORA"


async def test_ownership_is_enforced(db_session):
    owner = await _make_user(db_session)
    other = await _make_user(db_session)
    result = await chat.send_message(db_session, owner, content="Private")
    conv_id = result["conversation_id"]
    with pytest.raises(NotFoundError):
        await chat.get_conversation(db_session, other, conv_id)
    with pytest.raises(NotFoundError):
        await chat.list_messages(db_session, other, conv_id)


async def test_guest_message_is_not_persisted(db_session):
    guest = User(id=uuid.uuid4(), email=None, role="guest", subscription="free", is_active=True)
    result = await chat.send_message(db_session, guest, content="Hi")
    assert result["guest"] is True
    assert result["conversation_id"] is None


async def test_quota_enforced(db_session, monkeypatch):
    user = await _make_user(db_session)
    monkeypatch.setattr(usage, "get_limit", lambda plan, feature: 1)
    await chat.send_message(db_session, user, content="first")  # logs 1 unit
    with pytest.raises(QuotaExceededError):
        await chat.send_message(db_session, user, content="second")


async def test_unconfigured_provider_raises(db_session, monkeypatch):
    class NotConfigured(MockProvider):
        @property
        def is_configured(self) -> bool:
            return False

    monkeypatch.setattr(chat, "get_ai_provider", lambda: NotConfigured())
    user = await _make_user(db_session)
    with pytest.raises(ServiceUnavailableError):
        await chat.send_message(db_session, user, content="hi")


async def test_stream_message_yields_and_persists(db_session):
    user = await _make_user(db_session)
    events = [e async for e in chat.stream_message(db_session, user, content="Stream this")]
    assert events[0]["type"] == "chunk"
    assert events[-1]["type"] == "done"
    convs = await chat.list_conversations(db_session, user)
    msgs = await chat.list_messages(db_session, user, convs[0].id)
    assert msgs[-1].role == "assistant"
    assert msgs[-1].content  # accumulated text persisted
