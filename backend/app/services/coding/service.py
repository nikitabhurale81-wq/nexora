"""Coding Assistant: explain / generate / debug / review / refactor / errors.

SECURITY: this service NEVER executes code. It only sends code to the AI
provider for analysis and returns text. There is no sandbox and no eval/exec.
Any future execution feature must use a separately designed, isolated sandbox.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ServiceUnavailableError, ValidationAppError
from app.integrations.ai_providers.base import ChatMessage
from app.integrations.ai_providers.factory import default_model, get_ai_provider
from app.models.user import User
from app.services.usage.service import log_usage

ACTIONS = {
    "explain": "Explain what the following {lang} code does, step by step, clearly and concisely.",
    "generate": "Write {lang} code for the request below. Return the code plus a short explanation.",
    "debug": "Find bugs in the following {lang} code. Explain each issue and give a corrected version.",
    "review": "Review the following {lang} code for quality, readability, and security. Give actionable suggestions.",
    "refactor": "Refactor the following {lang} code to be cleaner and more maintainable without changing behavior. Explain the key changes.",
    "explain_error": "Explain the cause of the error below for the given {lang} code and how to fix it.",
}

SYSTEM_PROMPT = (
    "You are NEXORA's coding assistant. Be accurate and practical. Use fenced "
    "code blocks. Never claim to have executed code — you only analyze and "
    "write it. Flag security risks when relevant."
)


async def assist(
    db: AsyncSession,
    user: User,
    *,
    action: str,
    language: str = "python",
    code: str = "",
    instructions: str = "",
    error: str = "",
) -> dict:
    if action not in ACTIONS:
        raise ValidationAppError(f"Unsupported action. Use one of: {', '.join(ACTIONS)}")
    if action == "generate":
        if not instructions.strip():
            raise ValidationAppError("A description is required to generate code.")
    elif not code.strip():
        raise ValidationAppError("Code is required for this action.")

    provider = get_ai_provider()
    if not provider.is_configured:
        raise ServiceUnavailableError("The AI provider is not configured yet.")

    task = ACTIONS[action].format(lang=language)
    parts = [task]
    if instructions.strip():
        parts.append(f"\nRequest/instructions:\n{instructions}")
    if code.strip():
        parts.append(f"\nCode:\n```{language}\n{code}\n```")
    if error.strip():
        parts.append(f"\nError:\n{error}")

    messages: list[ChatMessage] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(parts)},
    ]
    result = await provider.generate(messages, default_model())
    await log_usage(db, user.id, "coding", action, tokens=result.total_tokens)
    await db.flush()
    return {"action": action, "language": language, "content": result.content, "model": result.model}
