"""Chat service: conversation/message management and AI generation.

Ownership is enforced on every conversation/message access. Guests get
ephemeral (non-persisted) chat. Provider failures surface as clear errors —
we never claim a message was generated when the provider call failed.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ServiceUnavailableError
from app.integrations.ai_providers.base import ChatMessage
from app.integrations.ai_providers.factory import default_model, get_ai_provider
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.services.usage.service import enforce_quota, log_usage

SYSTEM_PROMPT = (
    "You are NEXORA, a helpful, concise AI productivity assistant. "
    "Answer clearly and accurately. If you are unsure, say so."
)
CONTEXT_MESSAGE_LIMIT = 20


# --------------------------------------------------------------------------
# Conversation CRUD (registered users)
# --------------------------------------------------------------------------
async def create_conversation(
    db: AsyncSession, user: User, title: str | None = None, model: str | None = None
) -> Conversation:
    conv = Conversation(
        user_id=user.id, title=title or "New conversation", model=model or default_model()
    )
    db.add(conv)
    await db.flush()
    return conv


async def list_conversations(
    db: AsyncSession, user: User, *, include_archived: bool = False
) -> list[Conversation]:
    stmt = select(Conversation).where(Conversation.user_id == user.id)
    if not include_archived:
        stmt = stmt.where(Conversation.is_archived.is_(False))
    stmt = stmt.order_by(Conversation.updated_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_conversation(
    db: AsyncSession, user: User, conversation_id: uuid.UUID
) -> Conversation:
    conv = await db.get(Conversation, conversation_id)
    if conv is None or conv.user_id != user.id:
        raise NotFoundError("Conversation not found.")
    return conv


async def update_conversation(
    db: AsyncSession, user: User, conversation_id: uuid.UUID, **fields
) -> Conversation:
    conv = await get_conversation(db, user, conversation_id)
    for key in ("title", "is_favorite", "is_archived"):
        if key in fields and fields[key] is not None:
            setattr(conv, key, fields[key])
    await db.flush()
    return conv


async def delete_conversation(
    db: AsyncSession, user: User, conversation_id: uuid.UUID
) -> None:
    conv = await get_conversation(db, user, conversation_id)
    await db.delete(conv)
    await db.flush()


async def list_messages(
    db: AsyncSession, user: User, conversation_id: uuid.UUID
) -> list[Message]:
    await get_conversation(db, user, conversation_id)  # ownership check
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    return list((await db.execute(stmt)).scalars().all())


# --------------------------------------------------------------------------
# Context building
# --------------------------------------------------------------------------
async def _build_context(
    db: AsyncSession,
    user: User,
    conversation: Conversation | None,
    new_user_text: str,
) -> list[ChatMessage]:
    system = SYSTEM_PROMPT
    # Personalize with the user's enabled memories (registered users only).
    if user.role != "guest":
        from app.services.memory.service import get_active_memories, memories_to_context

        memories = await get_active_memories(db, user.id)
        extra = memories_to_context(memories)
        if extra:
            system = f"{SYSTEM_PROMPT}\n\n{extra}"

    context: list[ChatMessage] = [{"role": "system", "content": system}]
    if conversation is not None:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.asc())
            .limit(CONTEXT_MESSAGE_LIMIT)
        )
        for msg in (await db.execute(stmt)).scalars().all():
            context.append({"role": msg.role, "content": msg.content})
    else:
        context.append({"role": "user", "content": new_user_text})
    return context


def _autotitle(conversation: Conversation, first_text: str) -> None:
    if conversation.title in ("", "New conversation"):
        conversation.title = (first_text.strip()[:57] + "…") if len(first_text) > 58 else first_text.strip()


# --------------------------------------------------------------------------
# Message generation
# --------------------------------------------------------------------------
async def send_message(
    db: AsyncSession,
    user: User,
    *,
    content: str,
    conversation_id: uuid.UUID | None = None,
    model: str | None = None,
) -> dict:
    """Generate a complete (non-streaming) assistant reply."""
    provider = get_ai_provider()
    if not provider.is_configured:
        raise ServiceUnavailableError(
            "The AI provider is not configured yet. Add an API key to enable responses."
        )
    model = model or default_model()
    is_guest = user.role == "guest"

    if is_guest:
        context: list[ChatMessage] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ]
        result = await provider.generate(context, model)
        return {"conversation_id": None, "role": "assistant",
                "content": result.content, "model": model,
                "tokens": result.total_tokens, "guest": True}

    await enforce_quota(db, user.id, user.subscription, "messages")
    conversation = (
        await get_conversation(db, user, conversation_id)
        if conversation_id
        else await create_conversation(db, user, model=model)
    )
    db.add(Message(conversation_id=conversation.id, user_id=user.id, role="user", content=content))
    await db.flush()

    context = await _build_context(db, user, conversation, content)
    result = await provider.generate(context, model)

    assistant = Message(
        conversation_id=conversation.id, user_id=user.id, role="assistant",
        content=result.content, model=model, tokens=result.total_tokens,
    )
    db.add(assistant)
    _autotitle(conversation, content)
    await log_usage(db, user.id, "messages", "chat.send", tokens=result.total_tokens)
    await db.flush()

    return {"conversation_id": conversation.id, "message_id": assistant.id,
            "role": "assistant", "content": result.content, "model": model,
            "tokens": result.total_tokens, "guest": False}


async def stream_message(
    db: AsyncSession,
    user: User,
    *,
    content: str,
    conversation_id: uuid.UUID | None = None,
    model: str | None = None,
) -> AsyncIterator[dict]:
    """Yield streamed events: {'type':'chunk','text':...} then {'type':'done',...}."""
    provider = get_ai_provider()
    if not provider.is_configured:
        raise ServiceUnavailableError(
            "The AI provider is not configured yet. Add an API key to enable responses."
        )
    model = model or default_model()
    is_guest = user.role == "guest"

    if is_guest:
        context: list[ChatMessage] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ]
        async for chunk in provider.stream(context, model):
            yield {"type": "chunk", "text": chunk}
        yield {"type": "done", "conversation_id": None, "guest": True}
        return

    await enforce_quota(db, user.id, user.subscription, "messages")
    conversation = (
        await get_conversation(db, user, conversation_id)
        if conversation_id
        else await create_conversation(db, user, model=model)
    )
    db.add(Message(conversation_id=conversation.id, user_id=user.id, role="user", content=content))
    await db.flush()
    context = await _build_context(db, user, conversation, content)

    parts: list[str] = []
    async for chunk in provider.stream(context, model):
        parts.append(chunk)
        yield {"type": "chunk", "text": chunk}

    full = "".join(parts)
    assistant = Message(
        conversation_id=conversation.id, user_id=user.id, role="assistant",
        content=full, model=model,
    )
    db.add(assistant)
    _autotitle(conversation, content)
    await log_usage(db, user.id, "messages", "chat.stream", units=1)
    await db.flush()
    yield {"type": "done", "conversation_id": str(conversation.id),
           "message_id": str(assistant.id), "guest": False}
