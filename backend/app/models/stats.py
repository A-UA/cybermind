"""每日统计汇总数据模型"""
from datetime import datetime, date
from sqlmodel import SQLModel, Field


class DailyStats(SQLModel, table=True):
    """每日统计汇总表 — 业务表（无前缀）"""
    __tablename__ = "daily_stats"

    id: int | None = Field(default=None, primary_key=True)
    stat_date: date = Field(unique=True, index=True, description="统计日期")
    total_views: int = Field(default=0, description="总浏览量（去重后）")
    unique_ips: int = Field(default=0, description="独立IP数")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")
