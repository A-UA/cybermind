"""时间工具函数 — 统一时区处理，业务层唯一入口"""
from datetime import datetime, timezone, timedelta, time as datetime_time

# 上海时区 (UTC+8，无夏令时)
SHANGHAI_TZ = timezone(timedelta(hours=8))


def utc_now() -> datetime:
    """获取当前 UTC 时间（aware datetime）"""
    return datetime.now(timezone.utc)


def shanghai_now() -> datetime:
    """获取当前上海时间（aware datetime）"""
    return datetime.now(SHANGHAI_TZ)


def utc_today_start() -> datetime:
    """获取今天 UTC 零点"""
    now = utc_now()
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def shanghai_today_start() -> datetime:
    """获取今天上海时间零点（转为 UTC），用于"今日"统计"""
    now_sh = shanghai_now()
    today_sh = now_sh.replace(hour=0, minute=0, second=0, microsecond=0)
    return today_sh.astimezone(timezone.utc)
