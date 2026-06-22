"""Banner 业务数据模型"""

from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.base import TimestampMixin


class Banner(TimestampMixin, table=True):
    """Banner 表 — 业务表（无前缀）"""

    __tablename__ = "banners"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="Banner标题")
    image_url: str = Field(max_length=500, description="图片URL")
    link_url: Optional[str] = Field(
        default=None, max_length=500, description="点击跳转链接"
    )
    sort_order: int = Field(default=0, description="排序序号，值越小越靠前")
    is_active: bool = Field(default=True, description="是否启用")
    created_by: int = Field(foreign_key="sys_users.id", description="创建人ID")
