"""操作视频 Pydantic 架构模型"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    video_url: str
    cover_image: Optional[str] = None
    duration: Optional[int] = None
    category: Optional[str] = None
    sort_order: int
    is_active: bool
    view_count: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class VideoCreate(BaseModel):
    title: str = Field(..., max_length=200, description="视频标题")
    description: Optional[str] = Field(None, description="视频描述")
    video_url: str = Field(..., max_length=500, description="视频URL路径")
    cover_image: Optional[str] = Field(None, max_length=500, description="视频封面图URL路径")
    duration: Optional[int] = Field(None, description="视频时长（秒）")
    category: Optional[str] = Field(None, max_length=50, description="视频分类")
    sort_order: int = Field(0, description="排序序号")
    is_active: bool = Field(True, description="是否启用")


class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200, description="视频标题")
    description: Optional[str] = Field(None, description="视频描述")
    video_url: Optional[str] = Field(None, max_length=500, description="视频URL路径")
    cover_image: Optional[str] = Field(None, max_length=500, description="视频封面图URL路径")
    duration: Optional[int] = Field(None, description="视频时长（秒）")
    category: Optional[str] = Field(None, max_length=50, description="视频分类")
    sort_order: Optional[int] = Field(None, description="排序序号")
    is_active: Optional[bool] = Field(None, description="是否启用")
