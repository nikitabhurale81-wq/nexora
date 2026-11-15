"""User service — JIT provisioning and profile/preferences management.

Security: the user ``role`` is NEVER taken from token claims or client input.
New users always start as ``user``; admin is granted only by a trusted
server-side process (see scripts/set_admin.py).
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.subscription import Subscription
from app.models.user import User, UserPreferences

logger = get_logger("nexora.users")


def _display_name(claims: dict) -> str | None:
    meta = claims.get("user_metadata") or {}
    return meta.get("name") or meta.get("full_name") or None


def _avatar(claims: dict) -> str | None:
    meta = claims.get("user_metadata") or {}
    return meta.get("avatar_url") or meta.get("picture") or None


async def sync_user_from_claims(db: AsyncSession, claims: dict) -> User:
    """Create or update the local user row from verified token claims."""
    user_id = uuid.UUID(str(claims["sub"]))
    email = claims.get("email")

    user = await db.get(User, user_id)
    if user is None:
        user = User(
            id=user_id,
            email=email or f"{user_id}@users.noemail",
            name=_display_name(claims),
            avatar_url=_avatar(claims),
            role="user",          # never from claims
            subscription="free",
            is_active=True,
        )
        db.add(user)
        # Insert the user row first so dependent rows satisfy the FK.
        await db.flush()
        db.add(UserPreferences(user_id=user_id))
        db.add(Subscription(user_id=user_id, plan="free", status="active"))
        await db.flush()
        logger.info("Provisioned new user %s", user_id)
        return user

    # Keep profile fields in sync with the identity provider.
    changed = False
    if email and user.email != email:
        user.email = email
        changed = True
    new_name = _display_name(claims)
    if new_name and user.name != new_name:
        user.name = new_name
        changed = True
    new_avatar = _avatar(claims)
    if new_avatar and user.avatar_url != new_avatar:
        user.avatar_url = new_avatar
        changed = True
    if changed:
        await db.flush()
    return user


async def get_preferences(db: AsyncSession, user_id: uuid.UUID) -> UserPreferences:
    """Return the user's preferences, creating defaults if missing."""
    result = await db.execute(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    prefs = result.scalar_one_or_none()
    if prefs is None:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)
        await db.flush()
    return prefs
