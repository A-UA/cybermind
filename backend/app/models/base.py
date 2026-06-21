"""基础模型 Mixin — 提供自动时间戳字段"""
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
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
