"""FastAPI 应用入口 — 仅负责初始化，禁止放业务逻辑"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.seed import seed_database
from app.core.validation_exception import validation_exception_handler
from app.core.app_exception import app_exception_handler
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化种子数据
    try:
        seed_database()
    except Exception as e:
        print(f"初始化种子数据失败: {e}")
    yield


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    app = FastAPI(
        title="CyberMind CMS",
        description="CyberMind 后台管理系统 API",
        version="1.0.0",
        docs_url="/api/docs" if settings.APP_DEBUG else None,
        redoc_url="/api/redoc" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    # CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册 API 路由
    app.include_router(api_router)

    # 挂载本地存储静态文件
    from fastapi.staticfiles import StaticFiles
    from pathlib import Path
    uploads_dir = Path(settings.UPLOAD_DIR)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    if settings.STORAGE_BACKEND == "local":
        app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    # 统一异常处理
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    return app


app = create_app()


@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}

