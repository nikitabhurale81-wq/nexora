"""Provider-agnostic AI interface.

Feature services depend only on this abstraction, never on a specific SDK, so
providers can be switched through configuration without rewriting logic.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import TypedDict


class ChatMessage(TypedDict):
    """A single conversation turn passed to a provider."""

    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass
class AIResult:
    """Normalized result returned by every provider."""

    content: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class AIProvider(ABC):
    """Abstract base for all chat/completion providers."""

    name: str = "base"

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """True when the provider has the credentials it needs to run."""

    @abstractmethod
    async def generate(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AIResult:
        """Return a single, complete model response."""

    @abstractmethod
    def stream(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AsyncIterator[str]:
        """Yield response text chunks as they are produced."""
