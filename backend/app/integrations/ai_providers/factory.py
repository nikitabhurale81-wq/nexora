"""AI provider factory.

Selects the provider from ``AI_PROVIDER`` config. Tests monkeypatch
``get_ai_provider`` to inject the MockProvider, so real APIs are never called
in the suite.
"""

from __future__ import annotations

from functools import lru_cache

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.integrations.ai_providers.base import AIProvider
from app.integrations.ai_providers.gemini import GeminiProvider
from app.integrations.ai_providers.huggingface import HuggingFaceProvider
from app.integrations.ai_providers.mock import MockProvider
from app.integrations.ai_providers.openai_provider import OpenAIProvider

_REGISTRY: dict[str, type[AIProvider]] = {
    "gemini": GeminiProvider,
    "openai": OpenAIProvider,
    "huggingface": HuggingFaceProvider,
    "mock": MockProvider,
}


@lru_cache
def _provider_cache(name: str) -> AIProvider:
    cls = _REGISTRY.get(name)
    if cls is None:
        raise ServiceUnavailableError(f"Unknown AI provider '{name}'.")
    return cls()


def get_ai_provider() -> AIProvider:
    """Return the configured AI provider instance."""
    return _provider_cache(settings.ai_provider.lower())


def default_model() -> str:
    """The default model id for the configured provider."""
    return settings.ai_model
