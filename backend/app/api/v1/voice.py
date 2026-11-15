"""Voice endpoints: capabilities, speech-to-text, text-to-speech."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.voice import SpeakRequest
from app.services.voice import service as voice

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/capabilities")
async def capabilities(user: User = Depends(require_registered_user)) -> dict:
    return success(voice.capabilities())


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    audio = await file.read()
    result = await voice.transcribe(db, user, audio, file.content_type or "audio/wav")
    return success(result, "Transcribed")


@router.post("/speak")
async def speak(
    payload: SpeakRequest,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await voice.synthesize(db, user, payload.text, payload.voice)
    message = "Audio generated" if not result["use_browser_tts"] else "Use browser speech"
    return success(result, message)
