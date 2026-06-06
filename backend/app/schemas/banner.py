"""Banner 请求与响应 Schema 定义"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class BannerCreate(BaseModel):
    """创建 Banner 请求"""
    title: str = Field(..., max_length=200, description="Banner标题")
    image_url: str = Field(..., max_length=500, description="图片URL")
    link_url: Optional[str] = Field(None, max_length=500, description="跳转链接")
    sort_order: int = Field(default=0, description="排序序号")
    is_active: bool = Field(default=True, description="是否启用")


class BannerUpdate(BaseModel):
    """更新 Banner 请求"""
    title: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = Field(None, max_length=500)
    link_url: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BannerResponse(BaseModel):
    """Banner 响应数据"""
    id: int
    title: str
    image_url: str
    link_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
