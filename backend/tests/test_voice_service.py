"""Voice service tests (STT/TTS with a mocked provider)."""

from __future__ import annotations

import base64
import uuid

import pytest

from app.core.exceptions import ValidationAppError
from app.integrations.ai_providers.voice import VoiceProvider
from app.models.user import User
from app.services.voice import service as voice


class FakeVoice(VoiceProvider):
    name = "fake"

    def __init__(self, stt=True, tts=False):
        self._stt, self._tts = stt, tts

    @property
    def stt_available(self):
        return self._stt

    @property
    def tts_available(self):
        return self._tts

    async def transcribe(self, audio, mime):
        return "hello nexora"

    async def synthesize(self, text, voice):
        return b"AUDIOBYTES", "audio/mpeg"


async def _user(db):
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role="user", subscription="free", is_active=True)
    db.add(u)
    await db.flush()
    return u


def test_validate_audio_rules():
    with pytest.raises(ValidationAppError):
        voice.validate_audio("audio/wav", 0)
    with pytest.raises(ValidationAppError):
        voice.validate_audio("audio/wav", 999 * 1024 * 1024)
    with pytest.raises(ValidationAppError):
        voice.validate_audio("application/x-msdownload", 100)
    voice.validate_audio("audio/wav", 100)  # ok


async def test_transcribe(db_session, monkeypatch):
    monkeypatch.setattr(voice, "get_voice_provider", lambda: FakeVoice(stt=True))
    user = await _user(db_session)
    out = await voice.transcribe(db_session, user, b"RIFFfake", "audio/wav")
    assert out["text"] == "hello nexora"


async def test_speak_falls_back_to_browser_when_no_tts(db_session, monkeypatch):
    monkeypatch.setattr(voice, "get_voice_provider", lambda: FakeVoice(tts=False))
    user = await _user(db_session)
    out = await voice.synthesize(db_session, user, "Hello", "alloy")
    assert out["use_browser_tts"] is True
    assert out["audio"] is None


async def test_speak_returns_audio_when_tts_available(db_session, monkeypatch):
    monkeypatch.setattr(voice, "get_voice_provider", lambda: FakeVoice(tts=True))
    user = await _user(db_session)
    out = await voice.synthesize(db_session, user, "Hello", "alloy")
    assert out["use_browser_tts"] is False
    assert base64.b64decode(out["audio"]) == b"AUDIOBYTES"


def test_capabilities_shape(monkeypatch):
    monkeypatch.setattr(voice, "get_voice_provider", lambda: FakeVoice(stt=True, tts=False))
    cap = voice.capabilities()
    assert cap["stt_available"] is True
    assert cap["tts_available"] is False
    assert cap["tts_mode"] == "browser"
