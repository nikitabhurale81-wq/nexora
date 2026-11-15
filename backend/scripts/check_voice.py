"""Probe Gemini for real TTS (text->audio) and STT (audio->text)."""

from __future__ import annotations

import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google import genai
from google.genai import types

from app.core.config import settings

TTS_CANDIDATES = ["gemini-omni-flash-preview", "gemini-2.5-flash", "gemini-3.5-flash"]
STT_MODEL = "gemini-3.5-flash-lite"


def pcm_to_wav(pcm: bytes, rate: int = 24000, channels: int = 1, bits: int = 16) -> bytes:
    block = channels * bits // 8
    header = b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVE"
    header += b"fmt " + struct.pack("<IHHIIHH", 16, 1, channels, rate, rate * block, block, bits)
    header += b"data" + struct.pack("<I", len(pcm))
    return header + pcm


def main() -> None:
    client = genai.Client(api_key=settings.gemini_api_key)

    audio_bytes = None
    mime = None
    for model in TTS_CANDIDATES:
        try:
            resp = client.models.generate_content(
                model=model,
                contents="Say clearly: Hello from NEXORA, your voice assistant.",
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
                        )
                    ),
                ),
            )
            part = resp.candidates[0].content.parts[0]
            audio_bytes = part.inline_data.data
            mime = part.inline_data.mime_type
            print(f"TTS OK via {model}: {len(audio_bytes)} bytes, mime={mime}")
            break
        except Exception as exc:
            print(f"TTS failed via {model}: {str(exc)[:120]}")

    if not audio_bytes:
        print("No TTS model worked.")
        return

    wav = pcm_to_wav(audio_bytes) if "l16" in (mime or "").lower() or "pcm" in (mime or "").lower() else audio_bytes
    print("WAV size:", len(wav))

    # STT: feed the audio back and transcribe.
    try:
        part = types.Part.from_bytes(data=wav, mime_type="audio/wav")
        r = client.models.generate_content(
            model=STT_MODEL,
            contents=["Transcribe this audio verbatim. Return only the text.", part],
        )
        print("STT transcript:", r.text)
    except Exception as exc:
        print("STT failed:", str(exc)[:200])


if __name__ == "__main__":
    main()
