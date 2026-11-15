"""Conversation management endpoints (registered users only)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate,
    ConversationRead,
    ConversationUpdate,
    MessageRead,
)
from app.services.chat import service as chat

router = APIRouter(prefix="/conversations", tags=["conversations"])


def _conv(conv) -> dict:
    return ConversationRead.model_validate(conv).model_dump(mode="json")


@router.post("")
async def create(
    payload: ConversationCreate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    conv = await chat.create_conversation(db, user, payload.title, payload.model)
    return success(_conv(conv), "Conversation created")


@router.get("")
async def list_all(
    include_archived: bool = Query(default=False),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    convs = await chat.list_conversations(db, user, include_archived=include_archived)
    return success([_conv(c) for c in convs])


@router.get("/{conversation_id}")
async def detail(
    conversation_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    conv = await chat.get_conversation(db, user, conversation_id)
    messages = await chat.list_messages(db, user, conversation_id)
    return success(
        {
            "conversation": _conv(conv),
            "messages": [
                MessageRead.model_validate(m).model_dump(mode="json") for m in messages
            ],
        }
    )


@router.patch("/{conversation_id}")
async def update(
    conversation_id: uuid.UUID,
    payload: ConversationUpdate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    conv = await chat.update_conversation(
        db, user, conversation_id, **payload.model_dump(exclude_unset=True)
    )
    return success(_conv(conv), "Conversation updated")


@router.delete("/{conversation_id}")
async def remove(
    conversation_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await chat.delete_conversation(db, user, conversation_id)
    return success({"id": str(conversation_id)}, "Conversation deleted")


@router.get("/{conversation_id}/messages")
async def messages(
    conversation_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    msgs = await chat.list_messages(db, user, conversation_id)
    return success(
        [MessageRead.model_validate(m).model_dump(mode="json") for m in msgs]
    )
