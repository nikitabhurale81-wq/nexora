"""Authorization dependency tests (role gating), called directly."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.permissions import (
    get_current_user,
    require_admin,
    require_registered_user,
)
from app.models.user import User


def _user(role: str) -> User:
    return User(id=uuid.uuid4(), email="x@example.com", role=role, subscription="free", is_active=True)


async def test_get_current_user_requires_token():
    with pytest.raises(AuthenticationError):
        await get_current_user(user=None)


async def test_get_current_user_passes_through():
    u = _user("user")
    assert await get_current_user(user=u) is u


async def test_require_registered_blocks_guest():
    with pytest.raises(PermissionDeniedError):
        await require_registered_user(user=_user("guest"))


async def test_require_registered_allows_user_and_admin():
    assert (await require_registered_user(user=_user("user"))).role == "user"
    assert (await require_registered_user(user=_user("admin"))).role == "admin"


async def test_require_admin_blocks_non_admin():
    with pytest.raises(PermissionDeniedError):
        await require_admin(user=_user("user"))
    with pytest.raises(PermissionDeniedError):
        await require_admin(user=_user("guest"))


async def test_require_admin_allows_admin():
    assert (await require_admin(user=_user("admin"))).role == "admin"
