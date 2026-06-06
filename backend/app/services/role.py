"""角色管理业务逻辑"""
from sqlmodel import Session, select
from app.models.user import SysRole, SysPermission, SysRolePermission
from app.core.exceptions import BadRequestException, NotFoundException


def get_role_list(session: Session) -> list[SysRole]:
    """获取所有角色"""
    return session.exec(select(SysRole)).all()


def get_role_by_id(session: Session, role_id: int) -> SysRole:
    """根据 ID 获取角色"""
    role = session.get(SysRole, role_id)
    if not role:
        raise NotFoundException("角色不存在")
    return role


def create_role(session: Session, name: str, code: str, description: str = None) -> SysRole:
    """创建角色"""
    existing = session.exec(select(SysRole).where(SysRole.code == code)).first()
    if existing:
        raise BadRequestException(f"角色代码 '{code}' 已存在")

    role = SysRole(name=name, code=code, description=description)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def update_role(session: Session, role_id: int, **kwargs) -> SysRole:
    """更新角色"""
    role = get_role_by_id(session, role_id)
    for key, value in kwargs.items():
        if value is not None:
            setattr(role, key, value)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def delete_role(session: Session, role_id: int):
    """删除角色"""
    role = get_role_by_id(session, role_id)
    # 防止删除预置角色
    if role.code in ("super_admin", "content_admin", "customer_service"):
        raise BadRequestException("不允许删除预置角色")
    session.delete(role)
    session.commit()


def assign_permissions(session: Session, role_id: int, permission_ids: list[int]):
    """为角色分配权限"""
    role = get_role_by_id(session, role_id)

    # 验证权限
    for pid in permission_ids:
        perm = session.get(SysPermission, pid)
        if not perm:
            raise BadRequestException(f"权限 ID {pid} 不存在")

    # 清除旧关联
    existing = session.exec(
        select(SysRolePermission).where(SysRolePermission.role_id == role_id)
    ).all()
    for link in existing:
        session.delete(link)

    # 建立新关联
    for pid in permission_ids:
        link = SysRolePermission(role_id=role_id, permission_id=pid)
        session.add(link)

    session.commit()


def get_all_permissions(session: Session) -> list[SysPermission]:
    """获取所有权限"""
    return session.exec(select(SysPermission).order_by(SysPermission.module)).all()
