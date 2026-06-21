"""新闻资讯数据模型"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, TEXT
from app.core.db_types import UTCDateTime
from app.core.time import utc_now


class NewsArticle(SQLModel, table=True):
    """新闻资讯表 — 业务表（无前缀）"""
    __tablename__ = "news_articles"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="文章标题")
    summary: Optional[str] = Field(default=None, max_length=500, description="文章摘要")
    content: str = Field(sa_column=Column(TEXT), description="富文本内容")
    cover_image: Optional[str] = Field(default=None, max_length=500, description="封面图")
    category: Optional[str] = Field(default=None, max_length=50, description="分类")
    tags: Optional[str] = Field(default=None, max_length=500, description="标签(JSON数组字符串)")
    status: str = Field(default="draft", max_length=20, description="状态: draft / published / archived")
    view_count: int = Field(default=0, description="浏览量")
    is_top: bool = Field(default=False, description="是否置顶")
    published_at: Optional[datetime] = Field(sa_column=Column(UTCDateTime, nullable=True), default=None, description="发布时间")
    created_by: int = Field(foreign_key="sys_users.id", description="作者ID")
    created_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="创建时间")
    updated_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="更新时间")
