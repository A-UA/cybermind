"""新闻资讯 Pydantic 架构模型"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class NewsResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    status: str
    view_count: int
    is_top: bool
    published_at: Optional[datetime] = None
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class NewsCreate(BaseModel):
    title: str = Field(..., max_length=200, description="文章标题")
    summary: Optional[str] = Field(None, max_length=500, description="文章摘要")
    content: str = Field(..., description="富文本 HTML 内容")
    cover_image: Optional[str] = Field(None, max_length=500, description="封面图")
    category: Optional[str] = Field(None, max_length=50, description="分类")
    tags: Optional[str] = Field(None, max_length=500, description="标签(JSON数组字符串)")
    is_top: bool = Field(False, description="是否置顶")


class NewsUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200, description="文章标题")
    summary: Optional[str] = Field(None, max_length=500, description="文章摘要")
    content: Optional[str] = Field(None, description="富文本 HTML 内容")
    cover_image: Optional[str] = Field(None, max_length=500, description="封面图")
    category: Optional[str] = Field(None, max_length=50, description="分类")
    tags: Optional[str] = Field(None, max_length=500, description="标签(JSON数组字符串)")
    is_top: Optional[bool] = Field(None, description="是否置顶")


class NewsStatusUpdate(BaseModel):
    status: str = Field(..., description="状态: draft / published / archived")


class NewsHotItem(BaseModel):
    id: int
    title: str
    view_count: int


class NewsStatsResponse(BaseModel):
    total_articles: int = Field(..., description="总文章数")
    total_views: int = Field(..., description="总阅读数")
    hot_articles: List[NewsHotItem] = Field(..., description="Top 10 热文排行")
