"""用户、角色、权限相关数据模型 — 基础设施表（sys_ 前缀）"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel

from app.core.db_types import UTCDateTime
from app.core.time import utc_now
from app.models.base import TimestampMixin


class SysUserRole(SQLModel, table=True):
    """用户-角色关联表"""

    __tablename__ = "sys_user_roles"

    user_id: int = Field(foreign_key="sys_users.id", primary_key=True)
    role_id: int = Field(foreign_key="sys_roles.id", primary_key=True)


class SysRolePermission(SQLModel, table=True):
    """角色-权限关联表"""

    __tablename__ = "sys_role_permissions"

    role_id: int = Field(foreign_key="sys_roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="sys_permissions.id", primary_key=True)


class SysUser(TimestampMixin, table=True):
    """用户表"""

    __tablename__ = "sys_users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(
        max_length=50, unique=True, index=True, description="登录账号"
    )
    nickname: Optional[str] = Field(default=None, max_length=50, description="显示昵称")
    email: Optional[str] = Field(
        default=None, max_length=100, unique=True, description="邮箱"
    )
    hashed_password: str = Field(max_length=255, description="密码哈希")
    is_active: bool = Field(default=True, description="是否启用")
    avatar: Optional[str] = Field(default=None, max_length=500, description="头像URL")

    # 关系
    roles: list["SysRole"] = Relationship(
        back_populates="users", link_model=SysUserRole
    )


class SysRole(SQLModel, table=True):
    """角色表"""

    __tablename__ = "sys_roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, description="角色名称")
    code: str = Field(max_length=50, unique=True, description="角色代码")
    description: Optional[str] = Field(
        default=None, max_length=255, description="角色描述"
    )
    created_at: datetime = Field(
        sa_column=Column(UTCDateTime, nullable=False),
        default_factory=utc_now,
        description="创建时间",
    )

    # 关系
    users: list[SysUser] = Relationship(back_populates="roles", link_model=SysUserRole)
    permissions: list["SysPermission"] = Relationship(
        back_populates="roles", link_model=SysRolePermission
    )


class SysPermission(SQLModel, table=True):
    """权限表"""

    __tablename__ = "sys_permissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(
        max_length=100, unique=True, description="权限代码，如 banner:create"
    )
    name: str = Field(max_length=100, description="权限名称")
    module: str = Field(max_length=50, description="所属模块")

    # 关系
    roles: list[SysRole] = Relationship(
        back_populates="permissions", link_model=SysRolePermission
    )
