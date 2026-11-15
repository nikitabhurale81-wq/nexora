"""Voice providers: speech-to-text and text-to-speech.

- GeminiVoice: real STT via Gemini multimodal (uses GEMINI_API_KEY). TTS is
  not offered by the available Gemini models here, so tts_available is False
  and the frontend uses the browser's speech synthesis.
- OpenAIVoice: optional real STT (whisper) + TTS (tts-1) when an OpenAI key
  is configured.

Nothing is faked: if a capability isn't configured, callers get a clear
"unavailable" signal rather than a fake result.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError


class VoiceProvider(ABC):
    name = "base"

    @property
    @abstractmethod
    def stt_available(self) -> bool: ...

    @property
    @abstractmethod
    def tts_available(self) -> bool: ...

    @abstractmethod
    async def transcribe(self, audio: bytes, mime: str) -> str: ...

    @abstractmethod
    async def synthesize(self, text: str, voice: str) -> tuple[bytes, str]: ...


class GeminiVoice(VoiceProvider):
    name = "gemini"

    @property
    def stt_available(self) -> bool:
        return bool(settings.gemini_api_key.strip())

    @property
    def tts_available(self) -> bool:
        return False  # Gemini TTS not available via generateContent here.

    async def transcribe(self, audio: bytes, mime: str) -> str:
        if not self.stt_available:
            raise ServiceUnavailableError("Speech-to-text is not configured.")
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        part = types.Part.from_bytes(data=audio, mime_type=mime)
        resp = await client.aio.models.generate_content(
            model=settings.ai_model,
            contents=[
                "Transcribe this audio verbatim. Return ONLY the transcription "
                "text with no commentary. If there is no speech, return an empty string.",
                part,
            ],
        )
        return (resp.text or "").strip()

    async def synthesize(self, text: str, voice: str) -> tuple[bytes, str]:
        raise ServiceUnavailableError(
            "Server text-to-speech is not configured. Use browser speech, or "
            "set an OpenAI key and VOICE_PROVIDER=openai."
        )


class OpenAIVoice(VoiceProvider):
    name = "openai"

    @property
    def stt_available(self) -> bool:
        return bool((settings.stt_api_key or settings.openai_api_key).strip())

    @property
    def tts_available(self) -> bool:
        return bool((settings.tts_api_key or settings.openai_api_key).strip())

    def _client(self, key: str):
        from openai import AsyncOpenAI

        return AsyncOpenAI(api_key=key)

    async def transcribe(self, audio: bytes, mime: str) -> str:
        key = (settings.stt_api_key or settings.openai_api_key).strip()
        if not key:
            raise ServiceUnavailableError("Speech-to-text is not configured.")
        import io

        client = self._client(key)
        buf = io.BytesIO(audio)
        buf.name = "audio.wav"
        resp = await client.audio.transcriptions.create(model="whisper-1", file=buf)
        return (resp.text or "").strip()

    async def synthesize(self, text: str, voice: str) -> tuple[bytes, str]:
        key = (settings.tts_api_key or settings.openai_api_key).strip()
        if not key:
            raise ServiceUnavailableError("Text-to-speech is not configured.")
        client = self._client(key)
        resp = await client.audio.speech.create(
            model="tts-1", voice=voice or "alloy", input=text, response_format="mp3"
        )
        return resp.read(), "audio/mpeg"


def get_voice_provider() -> VoiceProvider:
    if settings.voice_provider.lower() == "openai":
        return OpenAIVoice()
    return GeminiVoice()
