"""站点配置管理路由"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse
from app.schemas.site_config import SiteConfigResponse, SiteConfigUpdate, SiteConfigBatchUpdate
from app.services import site_config as config_service

router = APIRouter(prefix="/site-config", tags=["站点配置"])


@router.get("", response_model=ApiResponse[List[SiteConfigResponse]],
            dependencies=[Depends(require_permission("config:read"))], summary="获取所有配置项")
async def list_configs(session: Session = Depends(get_session)):
    """获取所有配置项"""
    configs = config_service.get_all_configs(session)
    items = [
        SiteConfigResponse(
            id=c.id,
            config_key=c.config_key,
            config_value=c.config_value,
            config_type=c.config_type,
            description=c.description,
            updated_at=c.updated_at,
            updated_by=c.updated_by,
        ) for c in configs
    ]
    return ApiResponse(data=items)


@router.put("", response_model=ApiResponse[List[SiteConfigResponse]], summary="批量更新配置")
async def batch_update_configs(
    body: SiteConfigBatchUpdate,
    current_user: SysUser = Depends(require_permission("config:update")),
    session: Session = Depends(get_session),
):
    """批量更新配置项"""
    configs = config_service.batch_update_configs(session, body.configs, current_user.id)
    items = [
        SiteConfigResponse(
            id=c.id,
            config_key=c.config_key,
            config_value=c.config_value,
            config_type=c.config_type,
            description=c.description,
            updated_at=c.updated_at,
            updated_by=c.updated_by,
        ) for c in configs
    ]
    return ApiResponse(data=items, message="批量更新配置成功")


@router.put("/{key}", response_model=ApiResponse[SiteConfigResponse], summary="更新单个配置")
async def update_single_config(
    key: str,
    body: SiteConfigUpdate,
    current_user: SysUser = Depends(require_permission("config:update")),
    session: Session = Depends(get_session),
):
    """更新单个配置项"""
    config = config_service.update_config(session, key, body.config_value, current_user.id)
    return ApiResponse(
        data=SiteConfigResponse(
            id=config.id,
            config_key=config.config_key,
            config_value=config.config_value,
            config_type=config.config_type,
            description=config.description,
            updated_at=config.updated_at,
            updated_by=config.updated_by,
        ),
        message=f"更新配置 {key} 成功"
    )
