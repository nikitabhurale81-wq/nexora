"""Deterministic mock provider.

Used ONLY in automated tests and (optionally) local development so the test
suite never calls a paid API. It is never silently substituted for a real
provider in production — the factory selects it only when explicitly asked.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

from app.integrations.ai_providers.base import AIProvider, AIResult, ChatMessage


class MockProvider(AIProvider):
    name = "mock"

    @property
    def is_configured(self) -> bool:
        return True

    def _reply(self, messages: list[ChatMessage]) -> str:
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )
        return f"[mock reply] You said: {last_user}"

    async def generate(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AIResult:
        text = self._reply(messages)
        return AIResult(
            content=text,
            model=model,
            prompt_tokens=sum(len(m["content"].split()) for m in messages),
            completion_tokens=len(text.split()),
            total_tokens=sum(len(m["content"].split()) for m in messages) + len(text.split()),
        )

    async def stream(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AsyncIterator[str]:
        for word in self._reply(messages).split():
            yield word + " "
