"""后台管理 API v1 路由汇总 — 所有端点需鉴权"""
from fastapi import APIRouter
from app.api.v1.admin import auth, users, roles, upload, banners, site_config, news, help, videos, contact, tracking, stats

admin_router = APIRouter(prefix="/admin", tags=["后台管理"])

admin_router.include_router(auth.router)
admin_router.include_router(users.router)
admin_router.include_router(roles.router)
admin_router.include_router(upload.router)
admin_router.include_router(banners.router)
admin_router.include_router(site_config.router)
admin_router.include_router(news.router)
admin_router.include_router(help.router)
admin_router.include_router(videos.router)
admin_router.include_router(contact.router)
admin_router.include_router(tracking.router)
admin_router.include_router(stats.router)
