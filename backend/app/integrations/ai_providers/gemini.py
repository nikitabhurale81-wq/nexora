"""Google Gemini provider (SDK imported lazily so the app runs without it)."""

from __future__ import annotations

from collections.abc import AsyncIterator

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.integrations.ai_providers.base import AIProvider, AIResult, ChatMessage


class GeminiProvider(AIProvider):
    name = "gemini"

    @property
    def is_configured(self) -> bool:
        return bool(settings.gemini_api_key.strip())

    def _client(self):
        if not self.is_configured:
            raise ServiceUnavailableError(
                "Gemini is not configured. Set GEMINI_API_KEY to enable AI responses."
            )
        try:
            from google import genai  # lazy import
        except ImportError as exc:  # pragma: no cover
            raise ServiceUnavailableError("google-genai package is not installed.") from exc
        return genai.Client(api_key=settings.gemini_api_key)

    @staticmethod
    def _split(messages: list[ChatMessage]):
        """Separate the system instruction from the role-tagged turns."""
        system = "\n".join(m["content"] for m in messages if m["role"] == "system")
        contents = [
            {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
            for m in messages
            if m["role"] != "system"
        ]
        return system or None, contents

    async def generate(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AIResult:
        client = self._client()
        system, contents = self._split(messages)
        config = {"temperature": temperature}
        if system:
            config["system_instruction"] = system
        resp = await client.aio.models.generate_content(
            model=model, contents=contents, config=config
        )
        usage = getattr(resp, "usage_metadata", None)
        return AIResult(
            content=resp.text or "",
            model=model,
            prompt_tokens=getattr(usage, "prompt_token_count", 0) or 0,
            completion_tokens=getattr(usage, "candidates_token_count", 0) or 0,
            total_tokens=getattr(usage, "total_token_count", 0) or 0,
        )

    async def stream(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AsyncIterator[str]:
        client = self._client()
        system, contents = self._split(messages)
        config = {"temperature": temperature}
        if system:
            config["system_instruction"] = system
        stream = await client.aio.models.generate_content_stream(
            model=model, contents=contents, config=config
        )
        async for chunk in stream:
            if getattr(chunk, "text", None):
                yield chunk.text
