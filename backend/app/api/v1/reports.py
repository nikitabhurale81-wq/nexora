"""Report Center endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.report import ReportCreate, ReportRead
from app.services.reports import service as reports

router = APIRouter(prefix="/reports", tags=["reports"])


def _report(r) -> dict:
    return ReportRead.model_validate(r).model_dump(mode="json")


@router.get("/templates")
async def templates(user: User = Depends(require_registered_user)) -> dict:
    return success(reports.TEMPLATES)


@router.post("")
async def create(
    payload: ReportCreate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    report = await reports.create_report(
        db, user,
        title=payload.title,
        report_type=payload.report_type,
        fmt=payload.format,
        source_type=payload.source_type,
        source_id=payload.source_id,
        sections=[s.model_dump() for s in payload.sections],
    )
    return success(_report(report), "Report generated")


@router.get("")
async def list_all(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success([_report(r) for r in await reports.list_reports(db, user)])


@router.get("/{report_id}")
async def detail(
    report_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(_report(await reports.get_report(db, user, report_id)))


@router.get("/{report_id}/download")
async def download(
    report_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    url = await reports.download_url(db, user, report_id)
    return success({"url": url, "expires_in": 900})


@router.delete("/{report_id}")
async def remove(
    report_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await reports.delete_report(db, user, report_id)
    return success({"id": str(report_id)}, "Report deleted")
