"""Reusable authentication & authorization dependencies.

Identity always comes from the verified token — never from request bodies or
client-supplied user ids / roles.

- ``get_optional_user``   -> User | None (guest-friendly)
- ``get_current_user``    -> User (401 if missing/invalid)
- ``require_registered_user`` -> User (403 for guests)
- ``require_admin``       -> User (403 for non-admins)
"""

from __future__ import annotations

import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import AuthIdentity, authenticate
from app.database.session import get_db
from app.models.user import User

# auto_error=False so optional-auth endpoints work without a token.
_bearer = HTTPBearer(auto_error=False)


def _guest_user(identity: AuthIdentity) -> User:
    """Build a transient (non-persisted) guest user principal."""
    # Derive a stable UUID from the guest sub so the principal has an id.
    raw = identity.sub.split(":", 1)[-1]
    try:
        guest_id = uuid.UUID(raw)
    except ValueError:
        guest_id = uuid.uuid5(uuid.NAMESPACE_DNS, identity.sub)
    return User(id=guest_id, email=None, name="Guest", role="guest", subscription="free", is_active=True)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Return the authenticated user (or guest principal), or None if no token."""
    if credentials is None or not credentials.credentials:
        return None
    identity = await authenticate(credentials.credentials)
    if identity.is_guest:
        return _guest_user(identity)
    # Local import avoids a circular import at module load time.
    from app.services.users.service import sync_user_from_claims

    user = await sync_user_from_claims(db, identity.claims)
    if not user.is_active:
        raise PermissionDeniedError("This account is disabled.")
    return user


async def get_current_user(
    user: User | None = Depends(get_optional_user),
) -> User:
    """Require a valid token (registered user or guest)."""
    if user is None:
        raise AuthenticationError("Authentication required.")
    return user


async def require_registered_user(
    user: User = Depends(get_current_user),
) -> User:
    """Require a registered (non-guest) account."""
    if user.role not in ("user", "admin"):
        raise PermissionDeniedError("A registered account is required for this feature.")
    return user


async def require_admin(
    user: User = Depends(get_current_user),
) -> User:
    """Require the admin role."""
    if user.role != "admin":
        raise PermissionDeniedError("Administrator access required.")
    return user
