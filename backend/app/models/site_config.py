"""站点配置数据模型"""
from datetime import datetime
from sqlmodel import SQLModel, Field


class SiteConfig(SQLModel, table=True):
    """站点配置表 — 业务表（无前缀）"""
    __tablename__ = "site_configs"

    id: int | None = Field(default=None, primary_key=True)
    config_key: str = Field(max_length=100, unique=True, index=True, description="配置键名")
    config_value: str = Field(description="配置内容")
    config_type: str = Field(max_length=50, default="text", description="值类型: text / image / json")
    description: str | None = Field(default=None, max_length=255, description="配置描述")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="更新时间")
    updated_by: int | None = Field(default=None, foreign_key="sys_users.id", description="更新人ID")
