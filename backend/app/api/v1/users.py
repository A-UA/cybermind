"""用户管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.core.database import get_session
from app.core.deps import require_permission
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.user import UserCreate, UserUpdate, UserResponse, AssignRolesRequest
from app.services import user as user_service

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("", response_model=ApiResponse[PaginatedData[UserResponse]],
            dependencies=[Depends(require_permission("user:read"))])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    """获取用户列表"""
    users, total = user_service.get_user_list(session, page, page_size, keyword)
    items = [
        UserResponse(
            id=u.id, username=u.username, nickname=u.nickname,
            email=u.email, avatar=u.avatar, is_active=u.is_active,
            roles=[r.code for r in u.roles],
            created_at=u.created_at, updated_at=u.updated_at,
        ) for u in users
    ]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.post("", response_model=ApiResponse[UserResponse],
             dependencies=[Depends(require_permission("user:create"))])
async def create_user(body: UserCreate, session: Session = Depends(get_session)):
    """创建用户"""
    user = user_service.create_user(
        session,
        username=body.username,
        password=body.password,
        nickname=body.nickname,
        email=body.email,
        is_active=body.is_active,
    )
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[], created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.get("/{user_id}", response_model=ApiResponse[UserResponse],
            dependencies=[Depends(require_permission("user:read"))])
async def get_user(user_id: int, session: Session = Depends(get_session)):
    """获取用户详情"""
    user = user_service.get_user_by_id(session, user_id)
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[r.code for r in user.roles],
        created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.put("/{user_id}", response_model=ApiResponse[UserResponse],
            dependencies=[Depends(require_permission("user:update"))])
async def update_user(
    user_id: int, body: UserUpdate, session: Session = Depends(get_session)
):
    """更新用户"""
    user = user_service.update_user(
        session, user_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[r.code for r in user.roles],
        created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.delete("/{user_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("user:delete"))])
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    """删除用户（软删除）"""
    user_service.delete_user(session, user_id)
    return ApiResponse(message="用户已禁用")


@router.put("/{user_id}/roles", response_model=ApiResponse,
            dependencies=[Depends(require_permission("user:update"))])
async def assign_roles(
    user_id: int, body: AssignRolesRequest, session: Session = Depends(get_session)
):
    """为用户分配角色"""
    user_service.assign_roles(session, user_id, body.role_ids)
    return ApiResponse(message="角色分配成功")
