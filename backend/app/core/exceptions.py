"""统一异常定义"""
from fastapi import HTTPException, status


class AppException(HTTPException):
    """应用基础异常"""
    def __init__(self, code: int, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        super().__init__(status_code=status_code, detail=message)


class UnauthorizedException(AppException):
    """未认证异常"""
    def __init__(self, message: str = "未认证或 Token 已过期"):
        super().__init__(code=401, message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    """无权限异常"""
    def __init__(self, message: str = "无操作权限"):
        super().__init__(code=403, message=message, status_code=status.HTTP_403_FORBIDDEN)


class NotFoundException(AppException):
    """资源不存在异常"""
    def __init__(self, message: str = "资源不存在"):
        super().__init__(code=404, message=message, status_code=status.HTTP_404_NOT_FOUND)


class BadRequestException(AppException):
    """请求参数错误异常"""
    def __init__(self, message: str = "请求参数错误"):
        super().__init__(code=400, message=message, status_code=status.HTTP_400_BAD_REQUEST)


class ValidationException(AppException):
    """参数校验异常"""
    def __init__(self, message: str = "参数校验失败"):
        super().__init__(code=422, message=message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
