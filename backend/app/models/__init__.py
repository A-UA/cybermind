"""数据模型包 — 在此统一导入所有模型，确保 Alembic 能发现"""
from app.models.user import SysUser, SysRole, SysPermission, SysUserRole, SysRolePermission
from app.models.banner import Banner
