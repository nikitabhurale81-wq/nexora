"""AI Memory service tests."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.user import User
from app.services.memory import service as memory
from app.services.users.service import get_preferences


async def _user(db):
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role="user", subscription="free", is_active=True)
    db.add(u)
    await db.flush()
    return u


async def test_create_and_list(db_session):
    user = await _user(db_session)
    await memory.create_memory(db_session, user, title="Dark theme", content="User prefers dark mode", category="preferences")
    mems = await memory.list_memories(db_session, user)
    assert len(mems) == 1
    assert mems[0].enabled is True


async def test_invalid_category_rejected(db_session):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await memory.create_memory(db_session, user, title="x", content="y", category="nonsense")


async def test_secret_content_rejected(db_session):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await memory.create_memory(db_session, user, title="creds", content="my password: hunter2", category="other")


async def test_ownership_isolation(db_session):
    owner = await _user(db_session)
    other = await _user(db_session)
    mem = await memory.create_memory(db_session, owner, title="t", content="c")
    with pytest.raises(NotFoundError):
        await memory.get_memory(db_session, other, mem.id)


async def test_update_and_disable(db_session):
    user = await _user(db_session)
    mem = await memory.create_memory(db_session, user, title="t", content="c")
    updated = await memory.update_memory(db_session, user, mem.id, enabled=False, content="new")
    assert updated.enabled is False
    assert updated.content == "new"


async def test_active_memories_respects_enabled_and_preference(db_session):
    user = await _user(db_session)
    m1 = await memory.create_memory(db_session, user, title="a", content="one")
    await memory.create_memory(db_session, user, title="b", content="two")
    await memory.update_memory(db_session, user, m1.id, enabled=False)
    # One disabled -> only 1 active.
    active = await memory.get_active_memories(db_session, user.id)
    assert len(active) == 1
    # Global preference off -> none active.
    prefs = await get_preferences(db_session, user.id)
    prefs.memory_enabled = False
    await db_session.flush()
    assert await memory.get_active_memories(db_session, user.id) == []


async def test_memories_to_context():
    user_id = uuid.uuid4()
    from app.models.memory import UserMemory

    mems = [UserMemory(user_id=user_id, title="Theme", content="dark", category="preferences", enabled=True)]
    ctx = memory.memories_to_context(mems)
    assert ctx and "Theme" in ctx
    assert memory.memories_to_context([]) is None
