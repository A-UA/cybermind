"""数据统计服务层业务逻辑"""
from datetime import datetime, date, timedelta
from sqlmodel import Session, select, func

from app.models.stats import DailyStats
from app.models.tracking import TrackingEvent
from app.models.news import NewsArticle
from app.models.contact import ContactSubmission
from app.core.time import shanghai_today_start, utc_now


def sync_daily_stats(session: Session) -> None:
    """归档历史日期的访问数据到 daily_stats（今天除外）"""
    today_date = shanghai_today_start().date()

    # 1. 查找 tracking_events 中所有历史日期的独立日期列表
    stmt = select(func.date(TrackingEvent.created_at)).where(
        func.date(TrackingEvent.created_at) < today_date
    ).group_by(func.date(TrackingEvent.created_at))

    event_dates = session.exec(stmt).all()

    # 2. 查找已在 daily_stats 中存在的日期
    exist_stmt = select(DailyStats.stat_date)
    existing_dates = set(session.exec(exist_stmt).all())

    # 3. 对未归档的历史天数进行统计归档
    for hist_date in event_dates:
        if hist_date in existing_dates:
            continue

        pv_stmt = select(func.count(TrackingEvent.id)).where(
            func.date(TrackingEvent.created_at) == hist_date
        )
        total_views = session.exec(pv_stmt).one() or 0

        uv_stmt = select(func.count(func.distinct(TrackingEvent.ip_address))).where(
            func.date(TrackingEvent.created_at) == hist_date
        )
        unique_ips = session.exec(uv_stmt).one() or 0

        daily_stat = DailyStats(
            stat_date=hist_date,
            total_views=total_views,
            unique_ips=unique_ips
        )
        session.add(daily_stat)

    session.commit()


def get_overview_stats(session: Session) -> dict:
    """获取工作看板总览指标 (PV, 今日UV, 文章数, 待处理表单数)"""
    try:
        sync_daily_stats(session)
    except Exception as e:
        print(f"同步历史访问统计失败: {e}")

    # 1. 总访问量 PV
    total_pv = session.exec(select(func.count(TrackingEvent.id))).one() or 0

    # 2. 今日独立 IP 数 (UV) — 按上海时间计算"今天"
    today_start = shanghai_today_start()
    today_uv = session.exec(
        select(func.count(func.distinct(TrackingEvent.ip_address))).where(
            TrackingEvent.created_at >= today_start
        )
    ).one() or 0

    # 3. 文章总数
    news_count = session.exec(select(func.count(NewsArticle.id))).one() or 0

    # 4. 待处理联系我们留言表单数
    pending_contact_count = session.exec(
        select(func.count(ContactSubmission.id)).where(
            ContactSubmission.status == "unread"
        )
    ).one() or 0

    return {
        "total_pv": total_pv,
        "today_uv": today_uv,
        "news_count": news_count,
        "pending_contact_count": pending_contact_count,
    }


def get_trend_stats(session: Session, days: int = 7) -> list[dict]:
    """获取过去 days 天的 PV/UV 访问趋势 (包含今天实时数据)"""
    try:
        sync_daily_stats(session)
    except Exception as e:
        print(f"同步历史访问统计失败: {e}")

    today_date = shanghai_today_start().date()
    start_date = today_date - timedelta(days=days - 1)

    # 1. 查询历史归档的 daily_stats (排除今天)
    history_stats = session.exec(
        select(DailyStats).where(
            DailyStats.stat_date >= start_date,
            DailyStats.stat_date < today_date
        ).order_by(DailyStats.stat_date.asc())
    ).all()

    stat_map = {s.stat_date: (s.total_views, s.unique_ips) for s in history_stats}

    # 2. 实时查询今天的数据 — 按上海时间零点
    today_start_dt = shanghai_today_start()
    today_pv = session.exec(
        select(func.count(TrackingEvent.id)).where(
            TrackingEvent.created_at >= today_start_dt
        )
    ).one() or 0

    today_uv = session.exec(
        select(func.count(func.distinct(TrackingEvent.ip_address))).where(
            TrackingEvent.created_at >= today_start_dt
        )
    ).one() or 0

    stat_map[today_date] = (today_pv, today_uv)

    # 3. 生成完整的时间序列，如果某天没有数据，填充 0
    trend_list = []
    current_date = start_date
    while current_date <= today_date:
        pv, uv = stat_map.get(current_date, (0, 0))
        trend_list.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "pv": pv,
            "uv": uv
        })
        current_date += timedelta(days=1)

    return trend_list


def get_top_pages(session: Session, limit: int = 10) -> list[dict]:
    """获取最热门访问页面排行"""
    stmt = select(
        TrackingEvent.page_path,
        func.count(TrackingEvent.id).label("views")
    ).group_by(TrackingEvent.page_path).order_by(
        func.count(TrackingEvent.id).desc()
    ).limit(limit)

    results = session.exec(stmt).all()
    return [{"page_path": r[0], "views": r[1]} for r in results]
