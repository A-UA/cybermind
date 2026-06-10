"""API 路由汇总"""
from fastapi import APIRouter
from app.api.v1.admin import admin_router
from app.api.v1.public import public_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(admin_router)
api_router.include_router(public_router)



