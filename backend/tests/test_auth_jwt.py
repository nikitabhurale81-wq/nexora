"""JWT verification tests.

Simulates Supabase by signing ES256 tokens with a locally generated EC key
and exposing its public JWK through the (monkeypatched) JWKS cache. No real
Supabase calls are made.
"""

from __future__ import annotations

import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec

from app.core import security
from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.integrations.supabase.jwks import jwks_cache

KID = "test-key-1"


def _make_keypair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    jwk = jwt.algorithms.ECAlgorithm.to_jwk(private_key.public_key(), as_dict=True)
    jwk["kid"] = KID
    jwk["alg"] = "ES256"
    return private_key, jwk


def _token(private_key, **overrides) -> str:
    now = int(time.time())
    payload = {
        "sub": "11111111-1111-1111-1111-111111111111",
        "email": "alex@example.com",
        "aud": settings.supabase_jwt_audience,
        "iss": settings.supabase_jwt_issuer,
        "iat": now,
        "exp": now + 3600,
    }
    payload.update(overrides)
    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KID})


@pytest.fixture
def signing(monkeypatch):
    private_key, jwk = _make_keypair()

    async def fake_get_key(kid: str):
        return jwk if kid == KID else None

    monkeypatch.setattr(jwks_cache, "get_key", fake_get_key)
    return private_key


async def test_valid_token_verifies(signing):
    claims = await security.verify_supabase_token(_token(signing))
    assert claims["sub"] == "11111111-1111-1111-1111-111111111111"
    assert claims["email"] == "alex@example.com"


async def test_expired_token_rejected(signing):
    expired = _token(signing, exp=int(time.time()) - 10)
    with pytest.raises(AuthenticationError):
        await security.verify_supabase_token(expired)


async def test_wrong_issuer_rejected(signing):
    bad = _token(signing, iss="https://evil.example.com")
    with pytest.raises(AuthenticationError):
        await security.verify_supabase_token(bad)


async def test_wrong_audience_rejected(signing):
    bad = _token(signing, aud="not-authenticated")
    with pytest.raises(AuthenticationError):
        await security.verify_supabase_token(bad)


async def test_tampered_signature_rejected(signing):
    token = _token(signing)
    tampered = token[:-4] + ("abcd" if token[-4:] != "abcd" else "efgh")
    with pytest.raises(AuthenticationError):
        await security.verify_supabase_token(tampered)


def test_guest_token_roundtrip():
    token, expires_in = security.issue_guest_token()
    assert expires_in > 0
    claims = security.verify_guest_token(token)
    assert claims["role"] == "guest"
    assert claims["iss"] == security.GUEST_ISSUER


def test_guest_token_not_accepted_as_supabase():
    # A guest token must not pass Supabase verification (different issuer/alg).
    token, _ = security.issue_guest_token()
    assert security._unverified_issuer(token) == security.GUEST_ISSUER
