"""操作视频数据模型"""

from typing import Optional

from sqlalchemy import TEXT, Column
from sqlmodel import Field, SQLModel

from app.models.base import TimestampMixin


class OperationVideo(TimestampMixin, table=True):
    """操作视频表 — 业务表（无前缀）"""

    __tablename__ = "operation_videos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="视频标题")
    description: Optional[str] = Field(
        default=None, sa_column=Column(TEXT), description="视频描述"
    )
    video_url: str = Field(max_length=500, description="视频URL路径")
    cover_image: Optional[str] = Field(
        default=None, max_length=500, description="封面图URL路径"
    )
    duration: Optional[int] = Field(default=None, description="视频时长（秒）")
    category: Optional[str] = Field(default=None, max_length=50, description="视频分类")
    sort_order: int = Field(default=0, description="排序序号")
    is_active: bool = Field(default=True, description="是否启用")
    view_count: int = Field(default=0, description="观看量统计")
    created_by: int = Field(foreign_key="sys_users.id", description="上传人ID")
