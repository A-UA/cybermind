"""基础模型 Mixin — 提供自动时间戳字段"""

from datetime import datetime

from sqlalchemy import Column, event
from sqlmodel import Field, SQLModel
from pydantic import field_serializer

from app.core.db_types import UTCDateTime
from app.core.time import utc_now


class TimestampMixin(SQLModel):
    """所有业务表继承此 Mixin，自动获得 created_at / updated_at 字段"""

    created_at: datetime = Field(
        sa_column=Column(UTCDateTime, nullable=False),
        default_factory=utc_now,
        description="创建时间 (UTC)",
    )
    updated_at: datetime = Field(
        sa_column=Column(UTCDateTime, nullable=False),
        default_factory=utc_now,
        description="更新时间 (UTC)",
    )

    @field_serializer("*")
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d %H:%M:%S")
        return value


# 注册事件监听器，在更新前自动设置 updated_at
@event.listens_for(TimestampMixin, "before_update", propagate=True)
def receive_before_update(mapper, connection, target):
    """在更新记录前自动设置 updated_at 为当前 UTC 时间"""
    target.updated_at = utc_now()
