"""FastAPI 依赖注入 — 鉴权、权限校验、数据库会话"""
from fastapi import Depends, Cookie, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from jose import JWTError

from app.core.database import get_session
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import SysUser

# Bearer Token 提取器
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    session: Session = Depends(get_session),
) -> SysUser:
    """从 JWT Token 中解析当前登录用户"""
    if not credentials:
        raise UnauthorizedException()

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedException("Token 类型无效")
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException()
    except JWTError:
        raise UnauthorizedException()

    user = session.get(SysUser, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("用户不存在或已被禁用")

    return user


def require_permission(*permissions: str):
    """权限校验依赖工厂 — 检查当前用户是否拥有指定权限

    用法：
        @router.get("/", dependencies=[Depends(require_permission("banner:read"))])
    """
    async def _check_permission(
        current_user: SysUser = Depends(get_current_user),
        session: Session = Depends(get_session),
    ) -> SysUser:
        # 获取用户的所有权限代码
        user_permissions = set()
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        # 检查是否拥有所需权限（需要满足全部）
        for perm in permissions:
            if perm not in user_permissions:
                raise ForbiddenException(f"缺少权限: {perm}")

        return current_user

    return _check_permission
