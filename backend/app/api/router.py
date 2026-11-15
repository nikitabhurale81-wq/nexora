"""Top-level API router.

Aggregates versioned routers. Feature routers (chat, documents, etc.) are
added to ``v1`` in their respective phases.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import (
    admin,
    auth,
    chat,
    coding,
    conversations,
    datasets,
    documents,
    feedback,
    health,
    memory,
    rag,
    reports,
    subscriptions,
    usage,
    users,
    voice,
)

api_router = APIRouter()

# v1 routers
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(conversations.router)
api_router.include_router(chat.router)
api_router.include_router(documents.router)
api_router.include_router(rag.router)
api_router.include_router(datasets.router)
api_router.include_router(coding.router)
api_router.include_router(memory.router)
api_router.include_router(voice.router)
api_router.include_router(reports.router)
api_router.include_router(subscriptions.router)
api_router.include_router(usage.router)
api_router.include_router(feedback.router)
api_router.include_router(admin.router)
