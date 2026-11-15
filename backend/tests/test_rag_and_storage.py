"""RAG ownership guard + local storage roundtrip (offline)."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError
from app.integrations.ai_providers.base import AIProvider, AIResult
from app.integrations.ai_providers.embeddings import EmbeddingProvider
from app.models.user import User
from app.services.rag import service as rag
from app.services.storage.local import LocalStorage


class _StubChat(AIProvider):
    name = "stub"

    @property
    def is_configured(self) -> bool:
        return True

    async def generate(self, messages, model, *, temperature=0.7):
        return AIResult(content="stub", model=model)

    async def stream(self, messages, model, *, temperature=0.7):
        yield "stub"


class _StubEmbed(EmbeddingProvider):
    name = "stub"

    @property
    def is_configured(self) -> bool:
        return True

    async def embed(self, texts):
        return [[0.0] * 768 for _ in texts]


async def test_rag_rejects_unowned_document(db_session, monkeypatch):
    monkeypatch.setattr(rag, "get_ai_provider", lambda: _StubChat())
    monkeypatch.setattr(rag, "get_embedding_provider", lambda: _StubEmbed())
    user = User(id=uuid.uuid4(), email="u@ex.com", role="user", subscription="free", is_active=True)
    db_session.add(user)
    await db_session.flush()
    # A random document id the user does not own -> NotFound before any search.
    with pytest.raises(NotFoundError):
        await rag.query_documents(
            db_session, user, question="hi", document_id=uuid.uuid4()
        )


async def test_local_storage_roundtrip():
    storage = LocalStorage()
    key = f"test/{uuid.uuid4().hex}.txt"
    await storage.upload(key, b"payload", "text/plain")
    assert await storage.download(key) == b"payload"
    await storage.delete(key)
    with pytest.raises(NotFoundError):
        await storage.download(key)
