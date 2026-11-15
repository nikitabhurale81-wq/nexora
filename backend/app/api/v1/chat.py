"""Chat message endpoints: non-streaming and SSE streaming.

Both accept guests (ephemeral, non-persisted) and registered users
(persisted with quota enforcement).
"""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest
from app.services.chat import service as chat

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message")
async def send_message(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Generate a complete assistant reply."""
    result = await chat.send_message(
        db, user,
        content=payload.content,
        conversation_id=payload.conversation_id,
        model=payload.model,
    )
    # Normalize ids to strings for JSON.
    for key in ("conversation_id", "message_id"):
        if result.get(key) is not None:
            result[key] = str(result[key])
    return success(result, "Message generated")


@router.post("/stream")
async def stream_message(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Stream the assistant reply token-by-token as Server-Sent Events."""

    async def event_source():
        try:
            async for event in chat.stream_message(
                db, user,
                content=payload.content,
                conversation_id=payload.conversation_id,
                model=payload.model,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:  # emit a terminal error event, never a stack trace
            from app.core.exceptions import AppError

            message = exc.message if isinstance(exc, AppError) else "Generation failed."
            yield f"data: {json.dumps({'type': 'error', 'message': message})}\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
