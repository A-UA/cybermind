"""官网公开新闻资讯接口"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.news import NewsResponse
from app.services import news as news_service

router = APIRouter(prefix="/news", tags=["公开-新闻资讯"])


@router.get("", response_model=ApiResponse[PaginatedData[NewsResponse]], summary="获取公开新闻列表")
async def list_public_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
    session: Session = Depends(get_session),
):
    """获取公开新闻列表（仅已发布，置顶优先，支持分类过滤）"""
    articles, total = news_service.get_public_news_list(
        session, page, page_size, category
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
        )
        for a in articles
    ]
    return ApiResponse(
        data=PaginatedData(items=items, total=total, page=page, page_size=page_size)
    )


@router.get("/top", response_model=ApiResponse[list[NewsResponse]], summary="获取热门新闻")
async def get_top_news(
    limit: int = Query(5, ge=1, le=20),
    session: Session = Depends(get_session),
):
    """获取浏览量最高的热门新闻（仅已发布，不分页）"""
    articles = news_service.get_public_top_news(session, limit)
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
        )
        for a in articles
    ]
    return ApiResponse(data=items)


@router.get("/{id}", response_model=ApiResponse[NewsResponse], summary="获取公开新闻详情")
async def get_public_news_detail(id: int, session: Session = Depends(get_session)):
    """获取公开新闻详情（浏览量 +1）"""
    article = news_service.get_public_news_detail(session, id)
    return ApiResponse(
        data=NewsResponse(
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
        )
    )
