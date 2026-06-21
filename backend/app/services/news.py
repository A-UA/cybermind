"""新闻资讯业务逻辑服务"""
from sqlmodel import Session, select, func
from app.core.time import utc_now
from fastapi import HTTPException, status
from typing import List, Tuple, Optional

from app.models.news import NewsArticle
from app.schemas.news import NewsCreate, NewsUpdate


def get_news_list(
    session: Session,
    page: int,
    page_size: int,
    title: Optional[str] = None,
    status_filter: Optional[str] = None,
    category: Optional[str] = None
) -> Tuple[List[NewsArticle], int]:
    """获取文章列表，置顶项 (is_top=True) 排在最前面，其余按创建时间降序排序"""
    query = select(NewsArticle)
    
    if title:
        query = query.where(NewsArticle.title.like(f"%{title}%"))
    if status_filter:
        query = query.where(NewsArticle.status == status_filter)
    if category:
        query = query.where(NewsArticle.category == category)
        
    # 获取总数
    total = len(session.exec(query).all())
    
    # 复合排序并分页
    query = query.order_by(NewsArticle.is_top.desc(), NewsArticle.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    items = session.exec(query).all()
    
    return items, total


def get_news_by_id(session: Session, id: int, auto_increment_view: bool = False) -> NewsArticle:
    """根据 ID 获取文章详情。如果 auto_increment_view=True，则浏览量自增"""
    article = session.exec(select(NewsArticle).where(NewsArticle.id == id)).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"文章 ID #{id} 不存在"
        )
    
    if auto_increment_view:
        article.view_count += 1
        session.add(article)
        session.commit()
        session.refresh(article)
        
    return article


def create_article(session: Session, body: NewsCreate, author_id: int) -> NewsArticle:
    """创建文章"""
    article = NewsArticle(
        title=body.title,
        summary=body.summary,
        content=body.content,
        cover_image=body.cover_image,
        category=body.category,
        tags=body.tags,
        is_top=body.is_top,
        created_by=author_id,
        status="draft"  # 默认草稿
    )
    session.add(article)
    session.commit()
    session.refresh(article)
    return article


def update_article(session: Session, id: int, body: NewsUpdate) -> NewsArticle:
    """更新文章属性"""
    article = get_news_by_id(session, id)
    
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(article, key, value)
        
    article.updated_at = utc_now()
    session.add(article)
    session.commit()
    session.refresh(article)
    return article


def update_article_status(session: Session, id: int, target_status: str) -> NewsArticle:
    """更改文章状态，发布时记录时间"""
    article = get_news_by_id(session, id)
    if target_status not in ["draft", "published", "archived"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的状态值"
        )

    article.status = target_status
    if target_status == "published":
        article.published_at = utc_now()

    article.updated_at = utc_now()
    session.add(article)
    session.commit()
    session.refresh(article)
    return article


def delete_article(session: Session, id: int):
    """删除文章"""
    article = get_news_by_id(session, id)
    session.delete(article)
    session.commit()


def get_news_stats(session: Session) -> Tuple[int, int, List[NewsArticle]]:
    """获取文章数据统计：总文章数、总浏览量及阅读量最高的 Top 10 文章"""
    total_articles = session.exec(select(func.count(NewsArticle.id))).one()
    total_views = session.exec(select(func.sum(NewsArticle.view_count))).one() or 0
    
    # 浏览排行 Top 10
    hot_query = select(NewsArticle).order_by(NewsArticle.view_count.desc()).limit(10)
    hot_articles = session.exec(hot_query).all()
    
    return total_articles, total_views, hot_articles


def get_public_news_list(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    category: str | None = None,
) -> Tuple[List[NewsArticle], int]:
    """获取公开新闻列表（仅已发布，置顶优先，支持分页与分类过滤）"""
    query = select(NewsArticle).where(NewsArticle.status == "published")

    if category:
        query = query.where(NewsArticle.category == category)

    total = len(session.exec(query).all())

    query = query.order_by(NewsArticle.is_top.desc(), NewsArticle.published_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    items = session.exec(query).all()

    return items, total


def get_public_news_detail(session: Session, id: int) -> NewsArticle:
    """获取公开新闻详情（必须是已发布状态，浏览量 +1）"""
    article = get_news_by_id(session, id, auto_increment_view=True)
    if article.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"文章 ID #{id} 不存在",
        )
    return article
