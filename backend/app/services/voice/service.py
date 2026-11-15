"""Voice service: validated transcription and optional synthesis.

Audio is processed in memory and never stored. If server TTS is not
configured, the API tells the frontend to use the browser's speech
synthesis instead of returning a fake result.
"""

from __future__ import annotations

import base64

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ValidationAppError
from app.integrations.ai_providers.voice import get_voice_provider
from app.models.user import User
from app.services.usage.service import log_usage

ALLOWED_AUDIO_MIME = {
    "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4",
    "audio/m4a", "audio/x-m4a", "audio/webm", "audio/ogg", "audio/flac",
    "application/octet-stream",
}
MAX_AUDIO_MB = 25


def capabilities() -> dict:
    provider = get_voice_provider()
    return {
        "provider": provider.name,
        "stt_available": provider.stt_available,
        "tts_available": provider.tts_available,
        "tts_mode": "provider" if provider.tts_available else "browser",
    }


def validate_audio(mime: str, size: int) -> None:
    if size <= 0:
        raise ValidationAppError("Audio file is empty.")
    if size > MAX_AUDIO_MB * 1024 * 1024:
        raise ValidationAppError(f"Audio exceeds the {MAX_AUDIO_MB} MB limit.")
    base = (mime or "").split(";")[0].strip().lower()
    if base and base not in ALLOWED_AUDIO_MIME:
        raise ValidationAppError(f"Unsupported audio type: {mime}")


async def transcribe(db: AsyncSession, user: User, audio: bytes, mime: str) -> dict:
    validate_audio(mime, len(audio))
    provider = get_voice_provider()
    text = await provider.transcribe(audio, mime or "audio/wav")
    await log_usage(db, user.id, "voice", "stt", units=1, details={"bytes": len(audio)})
    await db.flush()
    return {"text": text, "provider": provider.name}


async def synthesize(db: AsyncSession, user: User, text: str, voice: str) -> dict:
    """Return audio (base64) if server TTS is configured; else signal browser TTS."""
    provider = get_voice_provider()
    if not provider.tts_available:
        return {"use_browser_tts": True, "text": text, "audio": None, "mime": None}
    audio, mime = await provider.synthesize(text, voice)
    await log_usage(db, user.id, "voice", "tts", units=1, details={"chars": len(text)})
    await db.flush()
    return {
        "use_browser_tts": False,
        "text": text,
        "audio": base64.b64encode(audio).decode(),
        "mime": mime,
    }
