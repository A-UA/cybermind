"""MinIO 对象存储实现"""
import uuid
from datetime import datetime
from io import BytesIO
from fastapi import UploadFile
from app.storage.base import StorageBackend
from app.core.config import settings


class MinIOStorage(StorageBackend):
    """MinIO S3 兼容存储"""

    def __init__(self):
        from minio import Minio
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        # 确保 Bucket 存在
        for bucket in [settings.MINIO_BUCKET_IMAGES, settings.MINIO_BUCKET_VIDEOS]:
            if not self.client.bucket_exists(bucket):
                self.client.make_bucket(bucket)

    def _get_bucket(self, file_type: str) -> str:
        """根据文件类型获取 Bucket"""
        if file_type == "videos":
            return settings.MINIO_BUCKET_VIDEOS
        return settings.MINIO_BUCKET_IMAGES

    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件到 MinIO"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)

        content = await file.read()
        stream = BytesIO(content)

        self.client.put_object(
            bucket, path, stream, len(content),
            content_type=file.content_type,
        )

        return await self.get_url(path)

    async def delete(self, path: str) -> bool:
        """从 MinIO 删除文件"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)
        self.client.remove_object(bucket, path)
        return True

    async def get_url(self, path: str) -> str:
        """获取 MinIO 文件 URL"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)
        protocol = "https" if settings.MINIO_USE_SSL else "http"
        return f"{protocol}://{settings.MINIO_ENDPOINT}/{bucket}/{path}"
