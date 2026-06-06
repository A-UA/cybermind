"""文件存储抽象接口"""
from abc import ABC, abstractmethod
from fastapi import UploadFile


class StorageBackend(ABC):
    """存储后端抽象基类"""

    @abstractmethod
    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件，返回访问 URL"""
        ...

    @abstractmethod
    async def delete(self, path: str) -> bool:
        """删除文件"""
        ...

    @abstractmethod
    async def get_url(self, path: str) -> str:
        """获取文件访问 URL"""
        ...
