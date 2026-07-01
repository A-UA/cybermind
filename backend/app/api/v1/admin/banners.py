"""Banner 管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse
from app.services import banner as banner_service

router = APIRouter(prefix="/banners", tags=["Banner管理"])


@router.get("", response_model=ApiResponse[PaginatedData[BannerResponse]],
            dependencies=[Depends(require_permission("banner:read"))], summary="获取 Banner 列表")
async def list_banners(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: bool | None = Query(None),
    session: Session = Depends(get_session),
):
    """获取 Banner 列表（支持分页及启用状态过滤）"""
    banners, total = banner_service.get_banner_list(
        session, page, page_size, is_active
    )
    items = [
        BannerResponse(
            id=b.id,
            title=b.title,
            description=b.description,
            image_url=b.image_url,
            link_url=b.link_url,
            sort_order=b.sort_order,
            is_active=b.is_active,
            created_by=b.created_by,
            created_at=b.created_at,
            updated_at=b.updated_at,
        ) for b in banners
    ]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.post("", response_model=ApiResponse[BannerResponse], summary="创建 Banner")
async def create_banner(
    body: BannerCreate,
    current_user: SysUser = Depends(require_permission("banner:create")),
    session: Session = Depends(get_session),
):
    """创建 Banner"""
    banner = banner_service.create_banner(session, body, current_user.id)
    return ApiResponse(data=BannerResponse(
        id=banner.id,
        title=banner.title,
        description=banner.description,
        image_url=banner.image_url,
        link_url=banner.link_url,
        sort_order=banner.sort_order,
        is_active=banner.is_active,
        created_by=banner.created_by,
        created_at=banner.created_at,
        updated_at=banner.updated_at,
    ))


@router.get("/{banner_id}", response_model=ApiResponse[BannerResponse],
            dependencies=[Depends(require_permission("banner:read"))], summary="获取 Banner 详情")
async def get_banner(banner_id: int, session: Session = Depends(get_session)):
    """获取 Banner 详情"""
    banner = banner_service.get_banner_by_id(session, banner_id)
    return ApiResponse(data=BannerResponse(
        id=banner.id,
        title=banner.title,
        description=banner.description,
        image_url=banner.image_url,
        link_url=banner.link_url,
        sort_order=banner.sort_order,
        is_active=banner.is_active,
        created_by=banner.created_by,
        created_at=banner.created_at,
        updated_at=banner.updated_at,
    ))


@router.put("/{banner_id}", response_model=ApiResponse[BannerResponse],
            dependencies=[Depends(require_permission("banner:update"))], summary="更新 Banner")
async def update_banner(
    banner_id: int,
    body: BannerUpdate,
    session: Session = Depends(get_session),
):
    """更新 Banner"""
    banner = banner_service.update_banner(session, banner_id, body)
    return ApiResponse(data=BannerResponse(
        id=banner.id,
        title=banner.title,
        description=banner.description,
        image_url=banner.image_url,
        link_url=banner.link_url,
        sort_order=banner.sort_order,
        is_active=banner.is_active,
        created_by=banner.created_by,
        created_at=banner.created_at,
        updated_at=banner.updated_at,
    ))


@router.delete("/{banner_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("banner:delete"))], summary="删除 Banner")
async def delete_banner(banner_id: int, session: Session = Depends(get_session)):
    """删除 Banner"""
    banner_service.delete_banner(session, banner_id)
    return ApiResponse(message="Banner 删除成功")
