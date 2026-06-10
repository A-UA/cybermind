"""数据埋点统计查询接口（需鉴权）"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.deps import require_permission
from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.services import tracking as tracking_service

router = APIRouter(prefix="/tracking", tags=["访问埋点"])


@router.get("/stats", response_model=ApiResponse[dict],
            dependencies=[Depends(require_permission("stats:read"))], summary="获取数据看板统计数据")
async def get_dashboard_stats_api(session: Session = Depends(get_session)):
    """获取数据看板指标 PV 和今日 UV 独立访问数"""
    stats_data = tracking_service.get_dashboard_stats(session)
    return ApiResponse(data=stats_data)
