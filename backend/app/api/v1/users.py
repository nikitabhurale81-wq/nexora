"""Current-user profile and preferences endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import (
    PreferencesRead,
    PreferencesUpdate,
    UserRead,
    UserUpdate,
)
from app.services.users.service import get_preferences

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def read_me(user: User = Depends(require_registered_user)) -> dict:
    return success(UserRead.model_validate(user).model_dump(mode="json"))


@router.patch("/me")
async def update_me(
    payload: UserUpdate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        user.name = data["name"]
    if "avatar_url" in data:
        user.avatar_url = data["avatar_url"]
    await db.flush()
    return success(UserRead.model_validate(user).model_dump(mode="json"), "Profile updated")


@router.get("/me/preferences")
async def read_preferences(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    prefs = await get_preferences(db, user.id)
    return success(PreferencesRead.model_validate(prefs).model_dump())


@router.patch("/me/preferences")
async def update_preferences(
    payload: PreferencesUpdate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    prefs = await get_preferences(db, user.id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(prefs, key, value)
    await db.flush()
    return success(
        PreferencesRead.model_validate(prefs).model_dump(), "Preferences updated"
    )
