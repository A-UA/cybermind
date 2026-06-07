"""API 路由汇总"""
from fastapi import APIRouter
from app.api.v1 import auth, users, roles, upload, banners, site_config, news, help, videos, contact, tracking, stats

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(upload.router)
api_router.include_router(banners.router)
api_router.include_router(site_config.router)
api_router.include_router(news.router)
api_router.include_router(help.router)
api_router.include_router(videos.router)
api_router.include_router(contact.router)
api_router.include_router(tracking.router)
api_router.include_router(stats.router)



