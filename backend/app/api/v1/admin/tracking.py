"""数据埋点访问上报接口"""
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.core.deps import require_permission
from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.schemas.tracking import TrackingEventRequest
from app.services import tracking as tracking_service

router = APIRouter(prefix="/tracking", tags=["访问埋点"])


@router.post("/event", response_model=ApiResponse[dict])
async def report_tracking_event(
    body: TrackingEventRequest,
    request: Request,
    session: Session = Depends(get_session)
):
    """前台公开埋点上报接口 (无需登录，静默去重防刷)"""
    # 1. 提取客户端 IP 优先读取 X-Forwarded-For 代理链首地址
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else "127.0.0.1"

    # 2. 提取 User-Agent
    user_agent = request.headers.get("user-agent")

    # 3. 记录日志（内部自动执行 5 分钟时间窗口指纹去重）
    tracking_service.record_tracking_event(
        session=session,
        ip_address=ip_address,
        page_path=body.page_path,
        user_agent=user_agent
    )

    # 4. 统一静默返回成功响应，隐藏去重状态
    return ApiResponse(data={"ok": True}, message="上报成功")


@router.get("/stats", response_model=ApiResponse[dict],
            dependencies=[Depends(require_permission("stats:read"))])
async def get_dashboard_stats_api(session: Session = Depends(get_session)):
    """获取数据看板指标 PV 和今日 UV 独立访问数"""
    stats_data = tracking_service.get_dashboard_stats(session)
    return ApiResponse(data=stats_data)
