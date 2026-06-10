"""操作视频管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse
from app.services import video as video_service

router = APIRouter(prefix="/videos", tags=["操作视频管理"])


@router.get("", response_model=ApiResponse[PaginatedData[VideoResponse]],
            dependencies=[Depends(require_permission("video:read"))], summary="获取视频列表")
async def list_videos(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
):
    """获取操作视频列表（分页）"""
    videos, total = video_service.get_videos(
        session, page, page_size, category, query, is_active
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
        ) for v in videos
    ]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.post("", response_model=ApiResponse[VideoResponse], summary="创建视频记录")
async def create_video(
    body: VideoCreate,
    current_user: SysUser = Depends(require_permission("video:create")),
    session: Session = Depends(get_session),
):
    """创建操作视频记录"""
    video = video_service.create_video(session, body, current_user.id)
    return ApiResponse(data=VideoResponse(
        id=video.id,
        title=video.title,
        description=video.description,
        video_url=video.video_url,
        cover_image=video.cover_image,
        duration=video.duration,
        category=video.category,
        sort_order=video.sort_order,
        is_active=video.is_active,
        view_count=video.view_count,
        created_by=video.created_by,
        created_at=video.created_at,
        updated_at=video.updated_at,
    ))


@router.get("/{video_id}", response_model=ApiResponse[VideoResponse],
            dependencies=[Depends(require_permission("video:read"))], summary="获取视频详情")
async def get_video(
    video_id: int,
    increment_view: bool = Query(False, description="是否自增播放次数"),
    session: Session = Depends(get_session)
):
    """获取操作视频详情"""
    video = video_service.get_video_by_id(session, video_id, increment_view=increment_view)
    return ApiResponse(data=VideoResponse(
        id=video.id,
        title=video.title,
        description=video.description,
        video_url=video.video_url,
        cover_image=video.cover_image,
        duration=video.duration,
        category=video.category,
        sort_order=video.sort_order,
        is_active=video.is_active,
        view_count=video.view_count,
        created_by=video.created_by,
        created_at=video.created_at,
        updated_at=video.updated_at,
    ))


@router.put("/{video_id}", response_model=ApiResponse[VideoResponse],
            dependencies=[Depends(require_permission("video:update"))], summary="更新视频信息")
async def update_video(
    video_id: int,
    body: VideoUpdate,
    session: Session = Depends(get_session),
):
    """修改操作视频属性"""
    video = video_service.update_video(session, video_id, body)
    return ApiResponse(data=VideoResponse(
        id=video.id,
        title=video.title,
        description=video.description,
        video_url=video.video_url,
        cover_image=video.cover_image,
        duration=video.duration,
        category=video.category,
        sort_order=video.sort_order,
        is_active=video.is_active,
        view_count=video.view_count,
        created_by=video.created_by,
        created_at=video.created_at,
        updated_at=video.updated_at,
    ))


@router.delete("/{video_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("video:delete"))], summary="删除视频")
async def delete_video(video_id: int, session: Session = Depends(get_session)):
    """删除操作视频"""
    video_service.delete_video(session, video_id)
    return ApiResponse(message="操作视频记录物理删除成功")
