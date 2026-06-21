"""数据库连接与会话管理"""
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)


@event.listens_for(engine, "connect")
def _set_mysql_timezone(dbapi_conn, connection_record):
    """每次 MySQL 连接建立时，设置会话时区为 UTC"""
    cursor = dbapi_conn.cursor()
    cursor.execute("SET time_zone = '+00:00'")
    cursor.close()


def get_session():
    """获取数据库会话（用于 FastAPI 依赖注入）"""
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """创建所有表（仅开发/测试用，生产环境使用 Alembic）"""
    SQLModel.metadata.create_all(engine)
