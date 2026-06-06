"""通用响应模式"""
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""
    code: int = 200
    message: str = "操作成功"
    data: Optional[T] = None


class PaginatedData(BaseModel, Generic[T]):
    """分页数据"""
    items: list[T]
    total: int
    page: int
    page_size: int


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    code: int = 200
    message: str = "操作成功"
    data: Optional[PaginatedData[T]] = None
