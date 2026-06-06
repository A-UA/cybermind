"""本地文件系统存储实现"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile
from app.storage.base import StorageBackend
from app.core.config import settings


class LocalStorage(StorageBackend):
    """本地文件存储"""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _generate_path(self, file_type: str, filename: str) -> str:
        """生成存储路径: {type}/{yyyy}/{mm}/{uuid}.{ext}"""
        now = datetime.utcnow()
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        return f"{file_type}/{now.year}/{now.month:02d}/{unique_name}"

    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件到本地"""
        full_path = self.upload_dir / path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        content = await file.read()
        with open(full_path, "wb") as f:
            f.write(content)

        return f"/uploads/{path}"

    async def delete(self, path: str) -> bool:
        """删除本地文件"""
        # 去掉前缀 /uploads/
        relative = path.lstrip("/uploads/")
        full_path = self.upload_dir / relative
        if full_path.exists():
            os.remove(full_path)
            return True
        return False

    async def get_url(self, path: str) -> str:
        """获取本地文件 URL"""
        return path  # 本地存储直接返回相对路径
