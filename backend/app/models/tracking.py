"""数据埋点访问事件数据模型"""
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, TEXT, BigInteger
from app.core.db_types import UTCDateTime
from app.core.time import utc_now


class TrackingEvent(SQLModel, table=True):
    """数据埋点访问日志表 — 业务表（无前缀）"""
    __tablename__ = "tracking_events"

    # 大容量表使用 BIGINT AUTO_INCREMENT
    id: int | None = Field(
        default=None,
        sa_column=Column(BigInteger, primary_key=True, autoincrement=True)
    )
    ip_address: str = Field(max_length=50, description="访客 IP 地址")
    page_path: str = Field(max_length=500, description="访问的页面路径")
    user_agent: str | None = Field(default=None, max_length=500, description="访客 UA 信息")
    fingerprint: str = Field(
        max_length=64,
        index=True,
        description="基于 IP+页面路径+5分钟窗口 的唯一 SHA256 指纹"
    )
    created_at: datetime = Field(sa_column=Column(UTCDateTime, nullable=False), default_factory=utc_now, description="记录时间")
