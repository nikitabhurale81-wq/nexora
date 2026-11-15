"""Consistent API response envelopes.

All endpoints return a predictable shape:

    success: {"success": true,  "data": <any>, "message": "..."}
    error:   {"success": false, "error": {"code": "...", "message": "..."}}
"""

from __future__ import annotations

from typing import Any


def success(data: Any = None, message: str = "Request completed") -> dict[str, Any]:
    """Build a standard success envelope."""
    return {"success": True, "data": data, "message": message}


def error(code: str, message: str, details: Any = None) -> dict[str, Any]:
    """Build a standard error envelope (no secrets, no stack traces)."""
    payload: dict[str, Any] = {"code": code, "message": message}
    if details is not None:
        payload["details"] = details
    return {"success": False, "error": payload}
