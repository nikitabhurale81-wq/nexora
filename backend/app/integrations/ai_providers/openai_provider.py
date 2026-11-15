"""OpenAI provider (SDK imported lazily so the app runs without it)."""

from __future__ import annotations

from collections.abc import AsyncIterator

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.integrations.ai_providers.base import AIProvider, AIResult, ChatMessage


class OpenAIProvider(AIProvider):
    name = "openai"

    @property
    def is_configured(self) -> bool:
        return bool(settings.openai_api_key.strip())

    def _client(self):
        if not self.is_configured:
            raise ServiceUnavailableError(
                "OpenAI is not configured. Set OPENAI_API_KEY to enable AI responses."
            )
        try:
            from openai import AsyncOpenAI  # lazy import
        except ImportError as exc:  # pragma: no cover
            raise ServiceUnavailableError("openai package is not installed.") from exc
        return AsyncOpenAI(api_key=settings.openai_api_key)

    async def generate(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AIResult:
        client = self._client()
        resp = await client.chat.completions.create(
            model=model,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            temperature=temperature,
        )
        usage = resp.usage
        return AIResult(
            content=resp.choices[0].message.content or "",
            model=model,
            prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
            completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
            total_tokens=getattr(usage, "total_tokens", 0) or 0,
        )

    async def stream(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AsyncIterator[str]:
        client = self._client()
        stream = await client.chat.completions.create(
            model=model,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            temperature=temperature,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
