"""存储模块 — 根据配置返回对应的存储后端实例"""
from app.core.config import settings
from app.storage.base import StorageBackend


def get_storage() -> StorageBackend:
    """获取当前配置的存储后端"""
    if settings.STORAGE_BACKEND == "minio":
        from app.storage.minio_storage import MinIOStorage
        return MinIOStorage()
    else:
        from app.storage.local import LocalStorage
        return LocalStorage()
