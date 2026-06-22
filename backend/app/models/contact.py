"""联系我们留言数据模型"""

from datetime import datetime
from typing import Optional

from sqlalchemy import TEXT, Column
from sqlmodel import Field, SQLModel

from app.core.db_types import UTCDateTime
from app.models.base import TimestampMixin


class ContactSubmission(TimestampMixin, table=True):
    """联系我们留言表 — 业务表（无前缀）"""

    __tablename__ = "contact_submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, description="留言人姓名")
    email: str = Field(max_length=150, description="留言人邮箱")
    phone: Optional[str] = Field(default=None, max_length=50, description="留言人电话")
    company: Optional[str] = Field(
        default=None, max_length=200, description="留言人公司"
    )
    subject: str = Field(max_length=200, description="留言主题")
    message: str = Field(sa_column=Column(TEXT), description="留言正文")
    status: str = Field(
        default="unread", max_length=20, description="状态: unread/read/processed"
    )
    remark: Optional[str] = Field(
        default=None, sa_column=Column(TEXT), description="客服备注/处理意见"
    )
    processed_by: Optional[int] = Field(
        default=None, foreign_key="sys_users.id", description="处理人ID"
    )
    processed_at: Optional[datetime] = Field(
        sa_column=Column(UTCDateTime, nullable=True),
        default=None,
        description="处理时间",
    )
