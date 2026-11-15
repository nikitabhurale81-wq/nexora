"""Authentication primitives.

- Verifies Supabase-issued access tokens via the project JWKS (ES256/RS256),
  checking signature, issuer, audience, and expiry.
- Issues and verifies short-lived *guest* session tokens signed locally with
  SECRET_KEY (HS256). Guest tokens are clearly namespaced so they can never
  be confused with Supabase tokens.

No secrets are logged. Verification failures raise ``AuthenticationError``.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

import jwt
from jwt import PyJWK

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.integrations.supabase.jwks import jwks_cache

GUEST_ISSUER = "nexora-guest"


@dataclass
class AuthIdentity:
    """The authenticated principal derived from a verified token."""

    sub: str
    email: str | None
    is_guest: bool
    claims: dict = field(default_factory=dict)


def _unverified_issuer(token: str) -> str | None:
    try:
        return jwt.decode(token, options={"verify_signature": False}).get("iss")
    except jwt.PyJWTError:
        return None


async def verify_supabase_token(token: str) -> dict:
    """Verify a Supabase access token and return its claims."""
    try:
        header = jwt.get_unverified_header(token)
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Malformed authentication token") from exc

    alg = header.get("alg", "ES256")

    if alg == "HS256":
        secret = settings.supabase_jwt_secret
        if not secret:
            raise AuthenticationError("Token algorithm not supported")
        key: object = secret
    else:
        kid = header.get("kid")
        if not kid:
            raise AuthenticationError("Token missing key id")
        jwk = await jwks_cache.get_key(kid)
        if not jwk:
            raise AuthenticationError("Unknown token signing key")
        key = PyJWK.from_dict(jwk).key

    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience=settings.supabase_jwt_audience or None,
            issuer=settings.supabase_jwt_issuer or None,
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Session has expired. Please sign in again.") from exc
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid or untrusted authentication token") from exc

    return claims


def issue_guest_token() -> tuple[str, int]:
    """Create a short-lived signed guest token. Returns (token, expires_in_s)."""
    ttl = timedelta(minutes=settings.guest_token_ttl_minutes)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": f"guest:{uuid.uuid4()}",
        "role": "guest",
        "type": "guest",
        "iss": GUEST_ISSUER,
        "iat": now,
        "exp": now + ttl,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm="HS256")
    return token, int(ttl.total_seconds())


def verify_guest_token(token: str) -> dict:
    """Verify a locally-issued guest token and return its claims."""
    try:
        claims = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            issuer=GUEST_ISSUER,
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Guest session has expired.") from exc
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid guest token") from exc
    return claims


async def authenticate(token: str) -> AuthIdentity:
    """Resolve a bearer token into an AuthIdentity (guest or registered)."""
    if _unverified_issuer(token) == GUEST_ISSUER:
        claims = verify_guest_token(token)
        return AuthIdentity(sub=claims["sub"], email=None, is_guest=True, claims=claims)

    claims = await verify_supabase_token(token)
    return AuthIdentity(
        sub=claims["sub"],
        email=claims.get("email"),
        is_guest=False,
        claims=claims,
    )
