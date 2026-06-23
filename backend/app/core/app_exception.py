

from fastapi import Request
from fastapi.responses import JSONResponse
from .exceptions import AppException

async def app_exception_handler(request: Request, exc: Exception):
    """统一处理业务异常"""
    if not isinstance(exc, AppException):
        return JSONResponse(
            status_code=500,
            content={"code": 500, "message": "服务器内部错误", "data": None},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": None,
        },
    )