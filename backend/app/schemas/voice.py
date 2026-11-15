"""Voice Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    voice: str = Field(default="alloy", max_length=40)
