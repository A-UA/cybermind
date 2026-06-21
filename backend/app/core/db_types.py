"""自定义数据库类型 — 读写自动补 UTC 时区"""
from datetime import datetime, timezone
from sqlalchemy import DateTime, TypeDecorator


class UTCDateTime(TypeDecorator):
    """
    写入数据库时：aware datetime → 剥掉 tzinfo 存为 naive UTC
    从数据库读取时：naive datetime → 补上 tzinfo=timezone.utc

    保证数据库永远存 naive UTC，Python 侧永远读到 aware UTC。
    """
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect):
        if value is not None and value.tzinfo is not None:
            return value.replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
