"""Dataset (Data Lab) endpoints: upload, preview, stats, safe analysis, AI Q&A."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.dataset import AnalyzeRequest, DatasetAskRequest, DatasetRead
from app.services.data_analysis import service as data

router = APIRouter(prefix="/datasets", tags=["data-lab"])


def _ds(d) -> dict:
    return DatasetRead.model_validate(d).model_dump(mode="json")


@router.post("")
async def upload(
    file: UploadFile = File(...),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    raw = await file.read()
    ds = await data.create_dataset(
        db, user, filename=file.filename or "dataset.csv", data=raw,
        content_type=file.content_type or "",
    )
    return success(_ds(ds), "Dataset uploaded")


@router.get("")
async def list_all(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success([_ds(d) for d in await data.list_datasets(db, user)])


@router.get("/{dataset_id}")
async def detail(
    dataset_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(_ds(await data.get_dataset(db, user, dataset_id)))


@router.get("/{dataset_id}/preview")
async def preview(
    dataset_id: uuid.UUID,
    rows: int = Query(default=20, ge=1, le=100),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await data.preview(db, user, dataset_id, rows))


@router.get("/{dataset_id}/stats")
async def stats(
    dataset_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await data.stats(db, user, dataset_id))


@router.post("/{dataset_id}/analyze")
async def analyze(
    dataset_id: uuid.UUID,
    payload: AnalyzeRequest,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await data.analyze(db, user, dataset_id, payload.operation, payload.params)
    return success(result)


@router.post("/{dataset_id}/ask")
async def ask(
    dataset_id: uuid.UUID,
    payload: DatasetAskRequest,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await data.ask(db, user, dataset_id, payload.question), "Answer generated")


@router.delete("/{dataset_id}")
async def remove(
    dataset_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await data.delete_dataset(db, user, dataset_id)
    return success({"id": str(dataset_id)}, "Dataset deleted")
