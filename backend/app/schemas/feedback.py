"""Feedback Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeedbackSubmit(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    message: str = Field(min_length=1, max_length=5000)
    category: str = Field(default="support", pattern="^(bug|feature|quality|praise|support)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")


class FeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    title: str
    message: str
    category: str
    priority: str
    status: str
    assignee: str | None
    votes: int
    created_at: datetime


class FeedbackStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|reviewing|resolved)$")
