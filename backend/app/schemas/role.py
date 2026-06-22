"""角色与权限请求/响应模式"""
from typing import Optional
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseModel


class RoleCreate(BaseModel):
    """创建角色请求"""
    name: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleUpdate(BaseModel):
    """更新角色请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleResponse(BaseModel):
    """角色响应"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    permissions: list[str] = []
    created_at: datetime


class PermissionResponse(BaseModel):
    """权限响应"""
    id: int
    code: str
    name: str
    module: str


class AssignPermissionsRequest(BaseModel):
    """分配权限请求"""
    permission_ids: list[int]
