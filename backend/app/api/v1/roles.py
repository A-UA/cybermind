"""角色权限管理路由"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_permission
from app.schemas.common import ApiResponse
from app.schemas.role import (
    RoleCreate, RoleUpdate, RoleResponse,
    PermissionResponse, AssignPermissionsRequest,
)
from app.services import role as role_service

router = APIRouter(prefix="/roles", tags=["角色权限"])


@router.get("", response_model=ApiResponse[list[RoleResponse]],
            dependencies=[Depends(require_permission("role:read"))])
async def list_roles(session: Session = Depends(get_session)):
    """获取角色列表"""
    roles = role_service.get_role_list(session)
    items = [
        RoleResponse(
            id=r.id, name=r.name, code=r.code,
            description=r.description,
            permissions=[p.code for p in r.permissions],
            created_at=r.created_at,
        ) for r in roles
    ]
    return ApiResponse(data=items)


@router.post("", response_model=ApiResponse[RoleResponse],
             dependencies=[Depends(require_permission("role:create"))])
async def create_role(body: RoleCreate, session: Session = Depends(get_session)):
    """创建角色"""
    role = role_service.create_role(session, body.name, body.code, body.description)
    return ApiResponse(data=RoleResponse(
        id=role.id, name=role.name, code=role.code,
        description=role.description, permissions=[],
        created_at=role.created_at,
    ))


@router.put("/{role_id}", response_model=ApiResponse[RoleResponse],
            dependencies=[Depends(require_permission("role:update"))])
async def update_role(
    role_id: int, body: RoleUpdate, session: Session = Depends(get_session)
):
    """更新角色"""
    role = role_service.update_role(
        session, role_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(data=RoleResponse(
        id=role.id, name=role.name, code=role.code,
        description=role.description,
        permissions=[p.code for p in role.permissions],
        created_at=role.created_at,
    ))


@router.delete("/{role_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("role:delete"))])
async def delete_role(role_id: int, session: Session = Depends(get_session)):
    """删除角色"""
    role_service.delete_role(session, role_id)
    return ApiResponse(message="角色已删除")


@router.put("/{role_id}/permissions", response_model=ApiResponse,
            dependencies=[Depends(require_permission("role:update"))])
async def assign_permissions(
    role_id: int, body: AssignPermissionsRequest,
    session: Session = Depends(get_session),
):
    """为角色分配权限"""
    role_service.assign_permissions(session, role_id, body.permission_ids)
    return ApiResponse(message="权限分配成功")


@router.get("/permissions", response_model=ApiResponse[list[PermissionResponse]],
            dependencies=[Depends(require_permission("role:read"))])
async def list_permissions(session: Session = Depends(get_session)):
    """获取所有权限列表"""
    perms = role_service.get_all_permissions(session)
    items = [
        PermissionResponse(id=p.id, code=p.code, name=p.name, module=p.module)
        for p in perms
    ]
    return ApiResponse(data=items)
