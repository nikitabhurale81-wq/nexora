"""User JIT-provisioning service tests against an in-memory database."""

from __future__ import annotations

import uuid

from app.models.user import User, UserPreferences
from app.services.users.service import get_preferences, sync_user_from_claims

UID = "22222222-2222-2222-2222-222222222222"


def _claims(**over) -> dict:
    base = {
        "sub": UID,
        "email": "sara@example.com",
        "user_metadata": {"name": "Sara Khan", "avatar_url": "https://img/a.png"},
    }
    base.update(over)
    return base


async def test_sync_creates_user_with_defaults(db_session):
    user = await sync_user_from_claims(db_session, _claims())
    assert str(user.id) == UID
    assert user.email == "sara@example.com"
    assert user.name == "Sara Khan"
    assert user.role == "user"          # never from claims
    assert user.subscription == "free"
    # Default preferences row is created.
    prefs = await get_preferences(db_session, user.id)
    assert isinstance(prefs, UserPreferences)
    assert prefs.memory_enabled is True


async def test_sync_is_idempotent_and_updates_profile(db_session):
    await sync_user_from_claims(db_session, _claims())
    updated = await sync_user_from_claims(
        db_session, _claims(email="sara.new@example.com", user_metadata={"name": "Sara K"})
    )
    assert updated.email == "sara.new@example.com"
    assert updated.name == "Sara K"
    # Still exactly one user row.
    from sqlalchemy import func, select

    count = (await db_session.execute(select(func.count()).select_from(User))).scalar_one()
    assert count == 1


async def test_role_cannot_be_set_from_claims(db_session):
    # Even if a forged claim includes an admin role, it is ignored.
    user = await sync_user_from_claims(
        db_session, _claims(sub=str(uuid.uuid4()), role="admin")
    )
    assert user.role == "user"
