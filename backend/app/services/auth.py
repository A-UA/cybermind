"""认证业务逻辑层"""
from sqlmodel import Session, select
from app.models.user import SysUser
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException, BadRequestException

# 简单的内存黑名单（生产环境建议用 Redis）
_refresh_token_blacklist: set[str] = set()


def authenticate_user(session: Session, username: str, password: str) -> SysUser:
    """验证用户名和密码"""
    statement = select(SysUser).where(SysUser.username == username)
    user = session.exec(statement).first()
    if not user:
        raise UnauthorizedException("用户名或密码错误")
    if not user.is_active:
        raise UnauthorizedException("账号已被禁用")
    if not verify_password(password, user.hashed_password):
        raise UnauthorizedException("用户名或密码错误")
    return user


def create_tokens(user_id: int) -> dict:
    """为用户生成 access_token 和 refresh_token"""
    access_token = create_access_token(subject=str(user_id))
    refresh_token = create_refresh_token(subject=str(user_id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


def blacklist_refresh_token(token: str):
    """将 refresh_token 加入黑名单"""
    _refresh_token_blacklist.add(token)


def is_token_blacklisted(token: str) -> bool:
    """检查 refresh_token 是否在黑名单中"""
    return token in _refresh_token_blacklist
