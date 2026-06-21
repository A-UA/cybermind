"""Banner 业务数据模型"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from app.core.db_types import UTCDateTime
from app.core.time import utc_now


class Banner(SQLModel, table=True):
    """Banner 表 — 业务表（无前缀）"""
    __tablename__ = "banners"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="Banner标题")
    image_url: str = Field(max_length=500, description="图片URL")
    link_url: Optional[str] = Field(default=None, max_length=500, description="点击跳转链接")
    sort_order: int = Field(default=0, description="排序序号，值越小越靠前")
    is_active: bool = Field(default=True, description="是否启用")
    created_by: int = Field(foreign_key="sys_users.id", description="创建人ID")
    created_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="创建时间")
    updated_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="更新时间")
