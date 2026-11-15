"""Report service: build content from a source, render, store, manage.

Every report belongs to the authenticated user. Generated files are stored in
object storage (R2/local); only metadata + the storage key live in the DB.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.report import Report
from app.models.user import User
from app.services.reports import renderers
from app.services.storage.factory import get_storage
from app.services.usage.service import enforce_quota, log_usage

FORMATS = {"pdf", "docx", "xlsx", "csv"}
TEMPLATES = [
    {"id": "summary", "name": "Summary Report", "description": "Concise overview with key points."},
    {"id": "analysis", "name": "Analysis Report", "description": "Detailed findings and recommendations."},
    {"id": "custom", "name": "Custom Report", "description": "Your own sections and content."},
]


async def _sections_from_conversation(db, user, conversation_id: uuid.UUID) -> list[dict]:
    from app.services.chat import service as chat

    await chat.get_conversation(db, user, conversation_id)  # ownership
    messages = await chat.list_messages(db, user, conversation_id)
    transcript = "\n\n".join(
        f"{m.role.upper()}: {m.content}" for m in messages
    )
    return [{"heading": "Conversation Transcript", "body": transcript or "No messages."}]


async def _sections_from_dataset(db, user, dataset_id: uuid.UUID) -> list[dict]:
    from app.services.data_analysis import service as data

    ds = await data.get_dataset(db, user, dataset_id)
    stats = await data.stats(db, user, dataset_id)
    lines = [
        f"Rows: {stats['row_count']}",
        f"Columns: {stats['column_count']}",
        "Missing values: " + ", ".join(f"{k}={v}" for k, v in stats["missing"].items()),
    ]
    sections = [{"heading": f"Dataset: {ds.name}", "body": "\n".join(lines)}]
    if stats["describe"]:
        desc_lines = [
            f"{col}: mean={d.get('mean')}, min={d.get('min')}, max={d.get('max')}"
            for col, d in stats["describe"].items()
        ]
        sections.append({"heading": "Numeric Summary", "body": "\n".join(desc_lines)})
    return sections


async def create_report(
    db: AsyncSession,
    user: User,
    *,
    title: str,
    report_type: str = "summary",
    fmt: str = "pdf",
    source_type: str = "manual",
    source_id: uuid.UUID | None = None,
    sections: list[dict] | None = None,
) -> Report:
    if fmt not in FORMATS:
        raise ValidationAppError(f"Unsupported format. Use one of: {', '.join(FORMATS)}")
    await enforce_quota(db, user.id, user.subscription, "reports")

    if source_type == "conversation":
        if not source_id:
            raise ValidationAppError("source_id is required for a conversation report.")
        built = await _sections_from_conversation(db, user, source_id)
    elif source_type == "dataset":
        if not source_id:
            raise ValidationAppError("source_id is required for a dataset report.")
        built = await _sections_from_dataset(db, user, source_id)
    else:  # manual
        built = sections or []
        if not built:
            raise ValidationAppError("Provide at least one section for a manual report.")

    data, _mime = renderers.render(title, built, fmt)

    report_id = uuid.uuid4()
    storage_key = f"reports/{user.id}/{report_id}/{title}.{fmt}"
    await get_storage().upload(storage_key, data, renderers.MIME[fmt])

    report = Report(
        id=report_id, user_id=user.id, title=title, report_type=report_type,
        format=fmt, status="completed", storage_key=storage_key,
        source_type=source_type, source_id=source_id,
    )
    db.add(report)
    await log_usage(db, user.id, "reports", "generate", units=1, details={"format": fmt})
    await db.flush()
    return report


async def list_reports(db: AsyncSession, user: User) -> list[Report]:
    stmt = select(Report).where(Report.user_id == user.id).order_by(Report.created_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_report(db: AsyncSession, user: User, report_id: uuid.UUID) -> Report:
    report = await db.get(Report, report_id)
    if report is None or report.user_id != user.id:
        raise NotFoundError("Report not found.")
    return report


async def download_url(db: AsyncSession, user: User, report_id: uuid.UUID) -> str:
    report = await get_report(db, user, report_id)
    if not report.storage_key:
        raise NotFoundError("Report file is not available.")
    return await get_storage().signed_url(report.storage_key)


async def delete_report(db: AsyncSession, user: User, report_id: uuid.UUID) -> None:
    report = await get_report(db, user, report_id)
    if report.storage_key:
        try:
            await get_storage().delete(report.storage_key)
        except Exception:
            pass
    await db.delete(report)
    await db.flush()
