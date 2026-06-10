"""公开 API 路由汇总 — 供官网落地页使用，无需鉴权"""
from fastapi import APIRouter
from app.api.v1.public import banners, news, help, videos, site_config, contact

public_router = APIRouter(prefix="/public", tags=["官网公开接口"])

public_router.include_router(banners.router)
public_router.include_router(news.router)
public_router.include_router(help.router)
public_router.include_router(videos.router)
public_router.include_router(site_config.router)
public_router.include_router(contact.router)
