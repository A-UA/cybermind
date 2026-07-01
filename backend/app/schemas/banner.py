"""Banner 请求与响应 Schema 定义"""
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseModel


class BannerCreate(BaseModel):
    """创建 Banner 请求"""
    title: str = Field(..., max_length=200, description="Banner标题")
    description: str | None = Field(default=None, max_length=500, description="描述")
    image_url: str = Field(..., max_length=500, description="图片URL")
    link_url: str | None = Field(default=None, max_length=500, description="跳转链接")
    sort_order: int = Field(default=0, description="排序序号")
    is_active: bool = Field(default=True, description="是否启用")


class BannerUpdate(BaseModel):
    """更新 Banner 请求"""
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    image_url: str | None = Field(default=None, max_length=500)
    link_url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None


class BannerResponse(BaseModel):
    """Banner 响应数据"""
    id: int
    title: str
    description: str | None = None
    image_url: str
    link_url: str | None = None
    sort_order: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
