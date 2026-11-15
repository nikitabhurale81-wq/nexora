"""Cloudflare R2 storage via the S3-compatible API (boto3, lazy import).

Objects are private; downloads use short-lived presigned URLs.
"""

from __future__ import annotations

import asyncio

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.services.storage.base import Storage


class R2Storage(Storage):
    name = "r2"

    def _client(self):
        try:
            import boto3  # lazy import
            from botocore.config import Config
        except ImportError as exc:  # pragma: no cover
            raise ServiceUnavailableError("boto3 is not installed.") from exc
        return boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint_url,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )

    async def upload(self, key: str, data: bytes, content_type: str) -> None:
        def _put() -> None:
            self._client().put_object(
                Bucket=settings.r2_bucket_name, Key=key, Body=data, ContentType=content_type
            )

        await asyncio.to_thread(_put)

    async def download(self, key: str) -> bytes:
        def _get() -> bytes:
            obj = self._client().get_object(Bucket=settings.r2_bucket_name, Key=key)
            return obj["Body"].read()

        return await asyncio.to_thread(_get)

    async def delete(self, key: str) -> None:
        def _del() -> None:
            self._client().delete_object(Bucket=settings.r2_bucket_name, Key=key)

        await asyncio.to_thread(_del)

    async def signed_url(self, key: str, expires_seconds: int = 900) -> str:
        def _sign() -> str:
            return self._client().generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.r2_bucket_name, "Key": key},
                ExpiresIn=expires_seconds,
            )

        return await asyncio.to_thread(_sign)
