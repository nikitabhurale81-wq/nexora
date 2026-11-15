"""AI Memory Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MemoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    content: str = Field(min_length=1, max_length=4000)
    category: str = Field(default="other")


class MemoryUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    content: str | None = Field(default=None, max_length=4000)
    category: str | None = None
    enabled: bool | None = None


class MemoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    category: str
    enabled: bool
    created_at: datetime
    updated_at: datetime


class MemorySettings(BaseModel):
    enabled: bool
