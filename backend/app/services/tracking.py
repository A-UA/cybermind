"""访问埋点事件业务逻辑服务"""
import time
import hashlib
from sqlmodel import Session, select, func

from app.models.tracking import TrackingEvent
from app.core.time import shanghai_today_start


def generate_fingerprint(ip: str, page_path: str) -> str:
    """生成 5 分钟时间窗口内的唯一指纹 (SHA256)"""
    time_window = int(time.time() // 300)
    raw_str = f"{ip}:{page_path}:{time_window}"
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()


def record_tracking_event(
    session: Session,
    ip_address: str,
    page_path: str,
    user_agent: str | None = None
) -> bool:
    """记录一次页面访问。若指纹在 5 分钟内已存在，则去重拦截不入库并返回 False；否则入库并返回 True。"""
    fingerprint = generate_fingerprint(ip_address, page_path)

    statement = select(TrackingEvent).where(TrackingEvent.fingerprint == fingerprint)
    exists = session.exec(statement).first()

    if exists:
        return False

    event = TrackingEvent(
        ip_address=ip_address,
        page_path=page_path,
        user_agent=user_agent,
        fingerprint=fingerprint
    )
    session.add(event)
    session.commit()
    return True


def get_dashboard_stats(session: Session) -> dict:
    """获取数据看板指标 PV 和今日 UV 独立访问数"""
    # 按上海时间计算"今天"零点
    today_start = shanghai_today_start()

    uv_query = select(func.count(func.distinct(TrackingEvent.ip_address))).where(
        TrackingEvent.created_at >= today_start
    )
    today_uv = session.exec(uv_query).one() or 0

    pv_query = select(func.count(TrackingEvent.id))
    total_pv = session.exec(pv_query).one() or 0

    return {
        "today_uv": today_uv,
        "total_pv": total_pv
    }
