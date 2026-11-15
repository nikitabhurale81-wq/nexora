"""Chat / conversation Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    title: str | None = Field(default=None, max_length=300)
    model: str | None = None


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    is_favorite: bool | None = None
    is_archived: bool | None = None


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: uuid.UUID
    title: str
    model: str | None = None
    is_favorite: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: uuid.UUID
    role: str
    content: str
    model: str | None = None
    tokens: int | None = None
    created_at: datetime


class ChatRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    content: str = Field(min_length=1, max_length=20000)
    conversation_id: uuid.UUID | None = None
    model: str | None = None
