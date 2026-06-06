"""新闻资讯管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional, List

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.news import NewsCreate, NewsUpdate, NewsStatusUpdate, NewsResponse, NewsStatsResponse, NewsHotItem
from app.services import news as news_service

router = APIRouter(prefix="/news", tags=["新闻资讯"])


@router.get("/", response_model=ApiResponse[PaginatedData[NewsResponse]],
            dependencies=[Depends(require_permission("news:read"))])
async def list_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    """获取新闻资讯文章列表（带多条件筛选与分页，置顶文章靠前）"""
    articles, total = news_service.get_news_list(
        session, page, page_size, title, status_filter, category
    )
    items = [
        NewsResponse(
            id=a.id,
            title=a.title,
            summary=a.summary,
            content=a.content,
            cover_image=a.cover_image,
            category=a.category,
            tags=a.tags,
            status=a.status,
            view_count=a.view_count,
            is_top=a.is_top,
            published_at=a.published_at,
            created_by=a.created_by,
            created_at=a.created_at,
            updated_at=a.updated_at,
        ) for a in articles
    ]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.get("/stats", response_model=ApiResponse[NewsStatsResponse],
            dependencies=[Depends(require_permission("news:read"))])
async def get_news_stats_api(session: Session = Depends(get_session)):
    """获取文章浏览量统计数据（总文章数、总浏览量及阅读排行 Top 10）"""
    total_articles, total_views, hot_articles = news_service.get_news_stats(session)
    
    hot_items = [
        NewsHotItem(
            id=a.id,
            title=a.title,
            view_count=a.view_count
        ) for a in hot_articles
    ]
    
    return ApiResponse(data=NewsStatsResponse(
        total_articles=total_articles,
        total_views=total_views,
        hot_articles=hot_items
    ))


@router.post("/", response_model=ApiResponse[NewsResponse])
async def create_news_article(
    body: NewsCreate,
    current_user: SysUser = Depends(require_permission("news:create")),
    session: Session = Depends(get_session),
):
    """创建新闻资讯文章"""
    article = news_service.create_article(session, body, current_user.id)
    return ApiResponse(data=NewsResponse(
        id=article.id,
        title=article.title,
        summary=article.summary,
        content=article.content,
        cover_image=article.cover_image,
        category=article.category,
        tags=article.tags,
        status=article.status,
        view_count=article.view_count,
        is_top=article.is_top,
        published_at=article.published_at,
        created_by=article.created_by,
        created_at=article.created_at,
        updated_at=article.updated_at,
    ))


@router.get("/{id}", response_model=ApiResponse[NewsResponse],
            dependencies=[Depends(require_permission("news:read"))])
async def get_news_article(
    id: int, 
    session: Session = Depends(get_session)
):
    """获取单条文章详情，并自增阅读量（模拟前端或展示被访问）"""
    article = news_service.get_news_by_id(session, id, auto_increment_view=True)
    return ApiResponse(data=NewsResponse(
        id=article.id,
        title=article.title,
        summary=article.summary,
        content=article.content,
        cover_image=article.cover_image,
        category=article.category,
        tags=article.tags,
        status=article.status,
        view_count=article.view_count,
        is_top=article.is_top,
        published_at=article.published_at,
        created_by=article.created_by,
        created_at=article.created_at,
        updated_at=article.updated_at,
    ))


@router.put("/{id}", response_model=ApiResponse[NewsResponse],
            dependencies=[Depends(require_permission("news:update"))])
async def update_news_article(
    id: int,
    body: NewsUpdate,
    session: Session = Depends(get_session),
):
    """修改新闻资讯文章属性"""
    article = news_service.update_article(session, id, body)
    return ApiResponse(data=NewsResponse(
        id=article.id,
        title=article.title,
        summary=article.summary,
        content=article.content,
        cover_image=article.cover_image,
        category=article.category,
        tags=article.tags,
        status=article.status,
        view_count=article.view_count,
        is_top=article.is_top,
        published_at=article.published_at,
        created_by=article.created_by,
        created_at=article.created_at,
        updated_at=article.updated_at,
    ))


@router.put("/{id}/status", response_model=ApiResponse[NewsResponse],
            dependencies=[Depends(require_permission("news:update"))])
async def update_article_publish_status(
    id: int,
    body: NewsStatusUpdate,
    session: Session = Depends(get_session),
):
    """变更文章发布状态 (如: draft -> published)"""
    article = news_service.update_article_status(session, id, body.status)
    return ApiResponse(data=NewsResponse(
        id=article.id,
        title=article.title,
        summary=article.summary,
        content=article.content,
        cover_image=article.cover_image,
        category=article.category,
        tags=article.tags,
        status=article.status,
        view_count=article.view_count,
        is_top=article.is_top,
        published_at=article.published_at,
        created_by=article.created_by,
        created_at=article.created_at,
        updated_at=article.updated_at,
    ))


@router.delete("/{id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("news:delete"))])
async def delete_news_article(
    id: int,
    session: Session = Depends(get_session),
):
    """删除文章"""
    news_service.delete_article(session, id)
    return ApiResponse(message="文章删除成功")
