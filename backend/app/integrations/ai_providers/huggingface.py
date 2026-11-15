"""HuggingFace Inference API provider (OpenAI-compatible endpoint)."""

from __future__ import annotations

from collections.abc import AsyncIterator

import httpx

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.integrations.ai_providers.base import AIProvider, AIResult, ChatMessage

HF_BASE_URL = "https://router.huggingface.co/v1"


class HuggingFaceProvider(AIProvider):
    name = "huggingface"

    @property
    def is_configured(self) -> bool:
        return bool(settings.huggingface_api_key.strip())

    def _headers(self) -> dict:
        if not self.is_configured:
            raise ServiceUnavailableError(
                "HuggingFace is not configured. Set HUGGINGFACE_API_KEY."
            )
        return {
            "Authorization": f"Bearer {settings.huggingface_api_key}",
            "Content-Type": "application/json",
        }

    async def generate(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AIResult:
        payload = {
            "model": model,
            "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
            "temperature": temperature,
            "max_tokens": 2048,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{HF_BASE_URL}/chat/completions",
                headers=self._headers(),
                json=payload,
            )
            if not resp.is_success:
                raise ServiceUnavailableError(
                    f"HuggingFace API error {resp.status_code}: {resp.text[:200]}"
                )
            data = resp.json()

        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        return AIResult(
            content=content,
            model=model,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0),
        )

    async def stream(
        self, messages: list[ChatMessage], model: str, *, temperature: float = 0.7
    ) -> AsyncIterator[str]:
        payload = {
            "model": model,
            "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
            "temperature": temperature,
            "max_tokens": 2048,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{HF_BASE_URL}/chat/completions",
                headers=self._headers(),
                json=payload,
            ) as resp:
                if not resp.is_success:
                    body = await resp.aread()
                    raise ServiceUnavailableError(
                        f"HuggingFace stream error {resp.status_code}: {body[:200]}"
                    )
                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    chunk = line[5:].strip()
                    if chunk == "[DONE]":
                        break
                    try:
                        import json
                        data = json.loads(chunk)
                        delta = data["choices"][0].get("delta", {})
                        text = delta.get("content", "")
                        if text:
                            yield text
                    except Exception:
                        continue
