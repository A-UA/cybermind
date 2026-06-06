"""操作视频业务逻辑服务"""
from datetime import datetime
from sqlmodel import Session, select, func, col
from fastapi import HTTPException, status
from typing import List, Optional, Tuple

from app.models.video import OperationVideo
from app.schemas.video import VideoCreate, VideoUpdate


def get_videos(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    query_str: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Tuple[List[OperationVideo], int]:
    """
    获取操作视频列表，支持分页，默认按 sort_order 升序，创建时间降序排序
    """
    statement = select(OperationVideo)
    
    if category is not None:
        statement = statement.where(OperationVideo.category == category)
    if query_str:
        statement = statement.where(
            (OperationVideo.title.like(f"%{query_str}%")) | 
            (OperationVideo.description.like(f"%{query_str}%"))
        )
    if is_active is not None:
        statement = statement.where(OperationVideo.is_active == is_active)
        
    # 总数
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()
        
    # 排序与分页
    statement = statement.order_by(col(OperationVideo.sort_order).asc(), col(OperationVideo.created_at).desc())
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    
    videos = session.exec(statement).all()
    return videos, total


def get_video_by_id(session: Session, id: int, increment_view: bool = False) -> OperationVideo:
    """
    根据 ID 获取视频详情。若 increment_view 为 True，则该视频播放次数自增 1 并保存。
    """
    video = session.exec(select(OperationVideo).where(OperationVideo.id == id)).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"操作视频 ID #{id} 不存在"
        )
        
    if increment_view:
        video.view_count += 1
        session.add(video)
        session.commit()
        session.refresh(video)
        
    return video


def create_video(session: Session, body: VideoCreate, author_id: int) -> OperationVideo:
    """
    创建视频元数据记录
    """
    video = OperationVideo(
        title=body.title,
        description=body.description,
        video_url=body.video_url,
        cover_image=body.cover_image,
        duration=body.duration,
        category=body.category,
        sort_order=body.sort_order,
        is_active=body.is_active,
        created_by=author_id
    )
    session.add(video)
    session.commit()
    session.refresh(video)
    return video


def update_video(session: Session, id: int, body: VideoUpdate) -> OperationVideo:
    """
    修改视频数据属性
    """
    video = get_video_by_id(session, id)
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(video, key, value)
        
    video.updated_at = datetime.utcnow()
    session.add(video)
    session.commit()
    session.refresh(video)
    return video


def delete_video(session: Session, id: int):
    """
    物理删除操作视频记录
    """
    video = get_video_by_id(session, id)
    session.delete(video)
    session.commit()
