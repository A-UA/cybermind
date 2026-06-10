"""官网公开埋点上报接口"""
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.schemas.tracking import TrackingEventRequest
from app.services import tracking as tracking_service

router = APIRouter(prefix="/tracking", tags=["公开-访问埋点"])


@router.post("/event", response_model=ApiResponse[dict])
async def report_tracking_event(
    body: TrackingEventRequest,
    request: Request,
    session: Session = Depends(get_session),
):
    """前台公开埋点上报接口 (无需登录，静默去重防刷)"""
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else "127.0.0.1"

    user_agent = request.headers.get("user-agent")

    tracking_service.record_tracking_event(
        session=session,
        ip_address=ip_address,
        page_path=body.page_path,
        user_agent=user_agent,
    )

    return ApiResponse(data={"ok": True}, message="上报成功")
