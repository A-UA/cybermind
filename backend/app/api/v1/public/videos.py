"""官网公开操作视频接口"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.video import VideoResponse
from app.services import video as video_service

router = APIRouter(prefix="/videos", tags=["公开-操作视频"])


@router.get("", response_model=ApiResponse[PaginatedData[VideoResponse]], summary="获取公开视频列表")
async def list_public_videos(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
    session: Session = Depends(get_session),
):
    """获取公开视频列表（仅已启用的，支持分类过滤）"""
    videos, total = video_service.get_public_videos(
        session, page, page_size, category
    )
    items = [
        VideoResponse(
            id=v.id,
            title=v.title,
            description=v.description,
            video_url=v.video_url,
            cover_image=v.cover_image,
            duration=v.duration,
            category=v.category,
            sort_order=v.sort_order,
            is_active=v.is_active,
            view_count=v.view_count,
            created_by=v.created_by,
            created_at=v.created_at,
            updated_at=v.updated_at,
        )
        for v in videos
    ]
    return ApiResponse(
        data=PaginatedData(items=items, total=total, page=page, page_size=page_size)
    )
