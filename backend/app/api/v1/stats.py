"""数据分析统计接口路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_permission
from app.schemas.common import ApiResponse
from app.services import stats as stats_service

router = APIRouter(prefix="/stats", tags=["数据统计"])


@router.get("/overview", response_model=ApiResponse[dict],
            dependencies=[Depends(require_permission("stats:read"))])
async def get_overview(session: Session = Depends(get_session)):
    """获取看板顶部四个维度的总览数据指标"""
    data = stats_service.get_overview_stats(session)
    return ApiResponse(data=data, message="获取总览数据成功")


@router.get("/trend", response_model=ApiResponse[list[dict]],
            dependencies=[Depends(require_permission("stats:read"))])
async def get_trend(
    days: int = Query(default=7, ge=1, le=90, description="获取的历史趋势天数"),
    session: Session = Depends(get_session)
):
    """获取过去若干天的 PV/UV 访问趋势折线图数据"""
    data = stats_service.get_trend_stats(session, days)
    return ApiResponse(data=data, message="获取访问趋势成功")


@router.get("/top-pages", response_model=ApiResponse[list[dict]],
            dependencies=[Depends(require_permission("stats:read"))])
async def get_top_pages(
    limit: int = Query(default=10, ge=1, le=50, description="页面排行榜单数"),
    session: Session = Depends(get_session)
):
    """获取最热门访问的前台页面排行榜"""
    data = stats_service.get_top_pages(session, limit)
    return ApiResponse(data=data, message="获取热门页面排行成功")
