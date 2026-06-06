"""用户管理业务逻辑"""
from typing import Optional
from sqlmodel import Session, select, func, col
from app.models.user import SysUser, SysRole, SysUserRole
from app.core.security import hash_password
from app.core.exceptions import BadRequestException, NotFoundException


def get_user_list(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
) -> tuple[list[SysUser], int]:
    """获取用户列表（分页/搜索）"""
    statement = select(SysUser)

    if keyword:
        statement = statement.where(
            (col(SysUser.username).contains(keyword)) |
            (col(SysUser.nickname).contains(keyword))
        )

    # 总数
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # 分页
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    statement = statement.order_by(col(SysUser.created_at).desc())
    users = session.exec(statement).all()

    return users, total


def get_user_by_id(session: Session, user_id: int) -> SysUser:
    """根据 ID 获取用户"""
    user = session.get(SysUser, user_id)
    if not user:
        raise NotFoundException("用户不存在")
    return user


def create_user(session: Session, username: str, password: str, **kwargs) -> SysUser:
    """创建用户"""
    # 检查用户名唯一
    existing = session.exec(
        select(SysUser).where(SysUser.username == username)
    ).first()
    if existing:
        raise BadRequestException(f"用户名 '{username}' 已存在")

    user = SysUser(
        username=username,
        hashed_password=hash_password(password),
        **kwargs,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user_id: int, **kwargs) -> SysUser:
    """更新用户信息"""
    user = get_user_by_id(session, user_id)

    # 如果传了新密码，需要哈希
    if "password" in kwargs and kwargs["password"]:
        kwargs["hashed_password"] = hash_password(kwargs.pop("password"))
    else:
        kwargs.pop("password", None)

    for key, value in kwargs.items():
        if value is not None:
            setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user_id: int):
    """删除用户（软删除）"""
    user = get_user_by_id(session, user_id)
    user.is_active = False
    session.add(user)
    session.commit()


def assign_roles(session: Session, user_id: int, role_ids: list[int]):
    """为用户分配角色"""
    user = get_user_by_id(session, user_id)

    # 验证角色是否存在
    for role_id in role_ids:
        role = session.get(SysRole, role_id)
        if not role:
            raise BadRequestException(f"角色 ID {role_id} 不存在")

    # 清除旧关联
    existing_links = session.exec(
        select(SysUserRole).where(SysUserRole.user_id == user_id)
    ).all()
    for link in existing_links:
        session.delete(link)

    # 建立新关联
    for role_id in role_ids:
        link = SysUserRole(user_id=user_id, role_id=role_id)
        session.add(link)

    session.commit()
