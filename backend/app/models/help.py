"""帮助中心数据模型"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, TEXT
from app.core.db_types import UTCDateTime
from app.core.time import utc_now


class HelpCategory(SQLModel, table=True):
    """帮助中心分类表 — 业务表（无前缀）"""
    __tablename__ = "help_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, description="分类名称")
    sort_order: int = Field(default=0, description="排序序号，值越小越靠前")
    created_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="创建时间")


class HelpQuestion(SQLModel, table=True):
    """帮助中心问答表 — 业务表（无前缀）"""
    __tablename__ = "help_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="help_categories.id", description="所属分类ID")
    question: str = Field(max_length=500, description="常见问题内容")
    answer: str = Field(sa_column=Column(TEXT), description="问题回答富文本内容")
    sort_order: int = Field(default=0, description="排序序号")
    is_active: bool = Field(default=True, description="是否启用")
    created_by: int = Field(foreign_key="sys_users.id", description="创建人ID")
    created_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="创建时间")
    updated_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="更新时间")
