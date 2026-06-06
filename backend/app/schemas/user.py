"""用户管理请求/响应模式"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """创建用户请求"""
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    is_active: bool = True


class UserUpdate(BaseModel):
    """更新用户请求"""
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    roles: list[str] = []
    created_at: datetime
    updated_at: datetime


class AssignRolesRequest(BaseModel):
    """分配角色请求"""
    role_ids: list[int]
