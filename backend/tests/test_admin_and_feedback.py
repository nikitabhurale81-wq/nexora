"""Admin service + feedback tests."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.user import User
from app.services.admin import service as admin
from app.services.feedback import service as feedback


async def _user(db, **kw):
    u = User(
        id=kw.pop("id", uuid.uuid4()),
        email=f"{uuid.uuid4().hex}@ex.com",
        role=kw.pop("role", "user"),
        subscription=kw.pop("subscription", "free"),
        is_active=kw.pop("is_active", True),
        **kw,
    )
    db.add(u)
    await db.flush()
    return u


# ---- Admin ----
async def test_list_users_filter_by_role(db_session):
    await _user(db_session, role="user")
    await _user(db_session, role="admin")
    result = await admin.list_users(db_session, role="admin", limit=50)
    assert len(result) == 1
    assert result[0]["role"] == "admin"


async def test_get_user_detail_counts_resources(db_session):
    user = await _user(db_session)
    from app.models.message import Message

    msg = Message(user_id=user.id, conversation_id=uuid.uuid4(), role="user", content="hi")
    db_session.add(msg)
    await db_session.flush()
    detail = await admin.get_user_detail(db_session, user.id)
    assert detail["resources"]["messages"] == 1


async def test_user_detail_missing(db_session):
    with pytest.raises(NotFoundError):
        await admin.get_user_detail(db_session, uuid.uuid4())


async def test_update_user_status_deactivates(db_session):
    user = await _user(db_session, is_active=True)
    result = await admin.update_user_status(db_session, user.id, False)
    assert result["is_active"] is False


async def test_cannot_deactivate_admin_via_api(db_session):
    adm = await _user(db_session, role="admin")
    with pytest.raises(ValidationAppError):
        await admin.update_user_status(db_session, adm.id, False)


async def test_activity_logs_recent(db_session):
    user = await _user(db_session)
    from app.services.usage.service import log_usage

    await log_usage(db_session, user.id, "chat", "message", units=1)
    logs = await admin.activity_logs(db_session, user_id=user.id, days=7, limit=100)
    assert len(logs) == 1
    assert logs[0]["feature"] == "chat"


async def test_system_stats_shape(db_session):
    await _user(db_session)
    stats = await admin.system_stats(db_session)
    assert "users" in stats
    assert stats["users"]["total"] >= 1


# ---- Feedback ----
async def test_submit_feedback(db_session):
    user = await _user(db_session)
    fb = await feedback.submit_feedback(
        db_session, user, title="Great app", message="Really love it!", category="praise"
    )
    assert fb.status == "new"
    assert fb.category == "praise"


async def test_list_feedback_filter_status(db_session):
    user = await _user(db_session)
    await feedback.submit_feedback(db_session, user, title="Bug", message="Found issue", category="bug")
    items = await feedback.list_feedback(db_session, status="new", limit=50)
    assert len(items) == 1


async def test_list_feedback_filter_category(db_session):
    user = await _user(db_session)
    await feedback.submit_feedback(db_session, user, title="Feature", message="Add X", category="feature")
    items = await feedback.list_feedback(db_session, category="feature", limit=50)
    assert len(items) == 1


async def test_update_feedback_status(db_session):
    user = await _user(db_session)
    fb = await feedback.submit_feedback(db_session, user, title="Ok", message="ok")
    updated = await feedback.update_feedback_status(db_session, fb.id, "reviewing")
    assert updated.status == "reviewing"


async def test_get_feedback_missing(db_session):
    with pytest.raises(NotFoundError):
        await feedback.get_feedback(db_session, uuid.uuid4())
