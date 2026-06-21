"""Banner 业务逻辑层"""
from typing import Optional
from sqlmodel import Session, select, func, col
from app.core.time import utc_now

from app.models.banner import Banner
from app.schemas.banner import BannerCreate, BannerUpdate
from app.core.exceptions import NotFoundException


def get_banner_list(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    is_active: Optional[bool] = None,
) -> tuple[list[Banner], int]:
    """获取 Banner 列表（分页/过滤）"""
    statement = select(Banner)

    if is_active is not None:
        statement = statement.where(Banner.is_active == is_active)

    # 总数
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # 排序：sort_order 升序，created_at 降序
    statement = statement.order_by(col(Banner.sort_order).asc(), col(Banner.created_at).desc())
    
    # 分页
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    banners = session.exec(statement).all()

    return banners, total


def get_banner_by_id(session: Session, banner_id: int) -> Banner:
    """根据 ID 获取 Banner 详情"""
    banner = session.get(Banner, banner_id)
    if not banner:
        raise NotFoundException("Banner 不存在")
    return banner


def create_banner(session: Session, banner_in: BannerCreate, creator_id: int) -> Banner:
    """创建 Banner"""
    banner = Banner(
        title=banner_in.title,
        image_url=banner_in.image_url,
        link_url=banner_in.link_url,
        sort_order=banner_in.sort_order,
        is_active=banner_in.is_active,
        created_by=creator_id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    session.add(banner)
    session.commit()
    session.refresh(banner)
    return banner


def update_banner(session: Session, banner_id: int, banner_in: BannerUpdate) -> Banner:
    """更新 Banner 信息"""
    banner = get_banner_by_id(session, banner_id)

    update_data = banner_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(banner, key, value)

    banner.updated_at = utc_now()
    
    session.add(banner)
    session.commit()
    session.refresh(banner)
    return banner


def delete_banner(session: Session, banner_id: int):
    """删除 Banner"""
    banner = get_banner_by_id(session, banner_id)
    session.delete(banner)
    session.commit()


def get_public_banners(session: Session) -> list[Banner]:
    """获取公开 Banner 列表（仅返回已启用的，按 sort_order 排序）"""
    statement = (
        select(Banner)
        .where(Banner.is_active == True)
        .order_by(col(Banner.sort_order).asc(), col(Banner.created_at).desc())
    )
    return session.exec(statement).all()
