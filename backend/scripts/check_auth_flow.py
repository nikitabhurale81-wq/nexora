"""Prove registered auth end-to-end: Supabase signup -> backend verify.

Signs up a throwaway user via Supabase (publishable key), then calls the
local backend /auth/me with the real Supabase token to confirm JWKS
verification + user provisioning. Prints each step.
"""

from __future__ import annotations

import os
import sys
import uuid

import httpx

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
PUBLISHABLE = os.environ.get("SUPABASE_ANON_KEY", "")
BACKEND = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000/api/v1")

email = f"nexora.test.{uuid.uuid4().hex[:8]}@gmail.com"
password = "TestPass123!"


def main() -> None:
    # 1) Supabase signup with the publishable (anon) key.
    r = httpx.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": PUBLISHABLE, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=30,
    )
    print("1) Supabase signup status:", r.status_code)
    data = r.json()
    token = data.get("access_token")
    if not token:
        print("   No session returned — email confirmation is likely ON.")
        print("   Turn OFF 'Confirm email' in Supabase to allow instant login,")
        print("   or confirm via the email link then sign in.")
        print("   raw:", {k: data.get(k) for k in ("msg", "error", "error_description", "code")})
        return
    print("   got a real Supabase access token for:", email)

    # 2) Backend verifies the token via JWKS and provisions the user.
    me = httpx.get(f"{BACKEND}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=30)
    print("2) backend /auth/me status:", me.status_code)
    print("   user:", me.json().get("data"))

    # 3) Registered chat -> conversation persisted.
    chat = httpx.post(
        f"{BACKEND}/chat/message",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Give a 5-word greeting."},
        timeout=120,
    )
    d = chat.json().get("data", {})
    print("3) chat status:", chat.status_code, "| guest:", d.get("guest"),
          "| conversation_id:", d.get("conversation_id"))
    print("   reply:", d.get("content"))

    # 4) List conversations for this user.
    convs = httpx.get(f"{BACKEND}/conversations", headers={"Authorization": f"Bearer {token}"}, timeout=30)
    print("4) conversations count:", len(convs.json().get("data", [])))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print("ERROR:", exc)
        sys.exit(1)
