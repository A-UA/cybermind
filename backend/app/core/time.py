"""时间工具函数 — 统一时区处理，业务层唯一入口"""

from datetime import datetime, timedelta, timezone

# 上海时区 (UTC+8，无夏令时)
SHANGHAI_TZ = timezone(timedelta(hours=8))


def get_local_tz() -> timezone:
    """获取当前服务器/宿主机的本地时区

    通过系统时间动态获取，无需硬编码。
    Docker 容器中通过设置 TZ 环境变量或挂载 /etc/localtime 来控制。
    """
    return datetime.now().astimezone().tzinfo  # type: ignore[return-value]


def utc_now() -> datetime:
    """获取当前 UTC 时间（aware datetime）"""
    return datetime.now(timezone.utc)


def shanghai_now() -> datetime:
    """获取当前上海时间（aware datetime）"""
    return datetime.now(SHANGHAI_TZ)


def local_now() -> datetime:
    """获取当前服务器本地时间（aware datetime）"""
    return datetime.now(get_local_tz())


def shanghai_today_start() -> datetime:
    """获取今天上海时间零点（转为 UTC），用于"今日"统计"""
    now_sh = shanghai_now()
    today_sh = now_sh.replace(hour=0, minute=0, second=0, microsecond=0)
    return today_sh.astimezone(timezone.utc)
