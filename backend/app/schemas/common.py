"""通用响应模式"""
from datetime import datetime, timezone
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel as PydanticBaseModel, field_serializer
from app.core.time import get_local_tz

T = TypeVar("T")


class BaseModel(PydanticBaseModel):
    """所有 API Schema 继承此基类，统一 datetime 序列化格式

    所有时间以 UTC 存储，序列化为 "YYYY-MM-DD HH:MM:SS" 格式，
    前端无需关心时区转换问题。
    """

    @field_serializer("*")
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            # 统一转为服务器本地时区后格式化
            local_value = value.astimezone(get_local_tz())
            return local_value.strftime("%Y-%m-%d %H:%M:%S")
        return value


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
