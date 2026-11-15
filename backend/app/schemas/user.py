"""User-related Pydantic schemas (request/response shapes)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserRead(BaseModel):
    """Public user profile returned to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str | None = None          # guests have no email
    name: str | None = None
    avatar_url: str | None = None
    role: str
    subscription: str
    is_active: bool
    created_at: datetime | None = None  # unset for transient guest principals


class UserUpdate(BaseModel):
    """Fields a user may change on their own profile."""

    name: str | None = Field(default=None, max_length=200)
    avatar_url: str | None = Field(default=None, max_length=1024)


class PreferencesRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: str
    language: str
    timezone: str
    default_model: str | None = None
    memory_enabled: bool


class PreferencesUpdate(BaseModel):
    theme: str | None = Field(default=None, max_length=20)
    language: str | None = Field(default=None, max_length=10)
    timezone: str | None = Field(default=None, max_length=64)
    default_model: str | None = Field(default=None, max_length=100)
    memory_enabled: bool | None = None


class GuestTokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str = "guest"
