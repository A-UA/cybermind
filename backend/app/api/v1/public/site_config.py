"""官网公开站点配置接口"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.services import site_config as config_service

router = APIRouter(prefix="/site-config", tags=["公开-站点配置"])


@router.get("", response_model=ApiResponse[dict[str, str]], summary="获取站点公开配置")
async def get_public_site_config(session: Session = Depends(get_session)):
    """获取站点公开配置项（key-value 字典）"""
    configs = config_service.get_public_configs(session)
    return ApiResponse(data=configs)
