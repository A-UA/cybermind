"""认证路由 — 登录/刷新Token/登出/个人信息"""
from fastapi import APIRouter, Depends, Response, Cookie
from sqlmodel import Session
from jose import JWTError

from app.core.database import get_session
from app.core.deps import get_current_user
from app.core.security import decode_token, hash_password, verify_password
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.schemas.common import ApiResponse
from app.schemas.auth import (
    LoginRequest, TokenResponse, UserInfoResponse,
    UpdateProfileRequest, ChangePasswordRequest,
)
from app.services.auth import (
    authenticate_user, create_tokens,
    blacklist_refresh_token, is_token_blacklisted,
)
from app.models.user import SysUser

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login", response_model=ApiResponse[TokenResponse], summary="用户登录")
async def login(
    body: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    """用户登录"""
    user = authenticate_user(session, body.username, body.password)
    tokens = create_tokens(user.id)

    # 设置 refresh_token 到 HTTP-Only Cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,  # 开发环境用 False，生产改 True
        samesite="lax",
        max_age=7 * 24 * 3600,  # 7天
    )

    return ApiResponse(data=TokenResponse(access_token=tokens["access_token"]))


@router.post("/refresh", response_model=ApiResponse[TokenResponse], summary="刷新 Access Token")
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    session: Session = Depends(get_session),
):
    """刷新 access_token"""
    if not refresh_token:
        raise UnauthorizedException("缺少 refresh_token")

    if is_token_blacklisted(refresh_token):
        raise UnauthorizedException("refresh_token 已失效")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Token 类型无效")
        user_id = payload.get("sub")
    except JWTError:
        raise UnauthorizedException("refresh_token 已过期或无效")

    user = session.get(SysUser, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("用户不存在或已被禁用")

    # 旧 token 加入黑名单，生成新 token
    blacklist_refresh_token(refresh_token)
    tokens = create_tokens(user.id)

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )

    return ApiResponse(data=TokenResponse(access_token=tokens["access_token"]))


@router.post("/logout", response_model=ApiResponse, summary="用户登出")
async def logout(
    response: Response,
    current_user: SysUser = Depends(get_current_user),
    refresh_token: str = Cookie(None),
):
    """登出 — 将 refresh_token 加入黑名单"""
    if refresh_token:
        blacklist_refresh_token(refresh_token)

    response.delete_cookie("refresh_token")
    return ApiResponse(message="登出成功")


@router.get("/me", response_model=ApiResponse[UserInfoResponse], summary="获取当前用户信息")
async def get_current_user_info(
    current_user: SysUser = Depends(get_current_user),
):
    """获取当前用户信息（含角色和权限列表）"""
    roles = [role.code for role in current_user.roles]
    permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            permissions.add(perm.code)

    return ApiResponse(data=UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        email=current_user.email,
        avatar=current_user.avatar,
        is_active=current_user.is_active,
        roles=roles,
        permissions=sorted(permissions),
    ))


@router.put("/me", response_model=ApiResponse[UserInfoResponse], summary="更新当前用户信息")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: SysUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """更新当前用户个人信息"""
    if body.nickname is not None:
        current_user.nickname = body.nickname
    if body.email is not None:
        current_user.email = body.email
    if body.avatar is not None:
        current_user.avatar = body.avatar

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    roles = [role.code for role in current_user.roles]
    permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            permissions.add(perm.code)

    return ApiResponse(data=UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        email=current_user.email,
        avatar=current_user.avatar,
        is_active=current_user.is_active,
        roles=roles,
        permissions=sorted(permissions),
    ))
