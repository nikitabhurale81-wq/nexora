"""Verify the configured Gemini key with a real chat + embedding call."""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google import genai

from app.core.config import settings


def main() -> None:
    if not settings.gemini_api_key:
        print("GEMINI_API_KEY not set")
        return
    client = genai.Client(api_key=settings.gemini_api_key)

    print("== chat test ==")
    resp = client.models.generate_content(
        model=settings.ai_model, contents="Reply with exactly: NEXORA online"
    )
    print("model:", settings.ai_model)
    print("reply:", resp.text)

    print("== embedding test ==")
    from google.genai import types

    emb = client.models.embed_content(
        model=settings.embedding_model,
        contents="hello world",
        config=types.EmbedContentConfig(output_dimensionality=settings.embedding_dim),
    )
    vec = emb.embeddings[0].values
    print("embedding model:", settings.embedding_model)
    print("embedding dim:", len(vec))


if __name__ == "__main__":
    main()
