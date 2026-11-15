"""Authentication endpoints.

- ``GET  /auth/me``    : verify the Supabase token, sync the local user, return it.
- ``POST /auth/guest`` : issue a short-lived guest session token.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.permissions import get_current_user
from app.core.responses import success
from app.core.security import issue_guest_token
from app.models.user import User
from app.schemas.user import GuestTokenRead, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def me(user: User = Depends(get_current_user)) -> dict:
    """Return the current authenticated principal (registered or guest)."""
    return success(UserRead.model_validate(user).model_dump(mode="json"), "Authenticated")


@router.post("/guest")
async def guest() -> dict:
    """Issue a signed, short-lived guest session token."""
    token, expires_in = issue_guest_token()
    payload = GuestTokenRead(access_token=token, expires_in=expires_in)
    return success(payload.model_dump(), "Guest session created")
