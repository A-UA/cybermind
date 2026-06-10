"""官网公开 Banner 接口"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.schemas.banner import BannerResponse
from app.services import banner as banner_service

router = APIRouter(prefix="/banners", tags=["公开-Banner"])


@router.get("", response_model=ApiResponse[list[BannerResponse]])
async def list_public_banners(session: Session = Depends(get_session)):
    """获取公开 Banner 列表（仅已启用的）"""
    banners = banner_service.get_public_banners(session)
    items = [
        BannerResponse(
            id=b.id,
            title=b.title,
            image_url=b.image_url,
            link_url=b.link_url,
            sort_order=b.sort_order,
            is_active=b.is_active,
            created_by=b.created_by,
            created_at=b.created_at,
            updated_at=b.updated_at,
        )
        for b in banners
    ]
    return ApiResponse(data=items)
