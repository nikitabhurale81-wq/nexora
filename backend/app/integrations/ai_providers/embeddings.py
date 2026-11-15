"""Embedding providers (provider-agnostic, batch-capable).

Produces fixed-dimension vectors (default 768) that match the pgvector
column width. If no provider key is configured, callers get a clear
ServiceUnavailableError — we never fabricate embeddings.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError


class EmbeddingProvider(ABC):
    name = "base"

    @property
    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Return one embedding vector per input text (same order)."""


class GeminiEmbedding(EmbeddingProvider):
    name = "gemini"

    @property
    def is_configured(self) -> bool:
        return bool(settings.gemini_api_key.strip())

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not self.is_configured:
            raise ServiceUnavailableError(
                "Embeddings are unavailable: GEMINI_API_KEY is not configured."
            )
        if not texts:
            return []
        try:
            from google import genai
            from google.genai import types
        except ImportError as exc:  # pragma: no cover
            raise ServiceUnavailableError("google-genai package is not installed.") from exc

        client = genai.Client(api_key=settings.gemini_api_key)
        resp = await client.aio.models.embed_content(
            model=settings.embedding_model,
            contents=texts,
            config=types.EmbedContentConfig(output_dimensionality=settings.embedding_dim),
        )
        return [list(e.values) for e in resp.embeddings]


class OpenAIEmbedding(EmbeddingProvider):
    name = "openai"

    @property
    def is_configured(self) -> bool:
        return bool(settings.openai_api_key.strip())

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not self.is_configured:
            raise ServiceUnavailableError(
                "Embeddings are unavailable: OPENAI_API_KEY is not configured."
            )
        if not texts:
            return []
        try:
            from openai import AsyncOpenAI
        except ImportError as exc:  # pragma: no cover
            raise ServiceUnavailableError("openai package is not installed.") from exc

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.embeddings.create(
            model=settings.embedding_model, input=texts, dimensions=settings.embedding_dim
        )
        return [d.embedding for d in resp.data]


def get_embedding_provider() -> EmbeddingProvider:
    provider = settings.embedding_provider.lower()
    if provider == "openai":
        return OpenAIEmbedding()
    return GeminiEmbedding()
