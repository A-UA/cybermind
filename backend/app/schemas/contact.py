"""联系我们 Pydantic 模式校验"""
from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.common import BaseModel


class ContactSubmitRequest(BaseModel):
    """前台留言提交请求"""
    name: str = Field(..., max_length=100, description="留言人姓名")
    email: EmailStr = Field(..., max_length=150, description="留言人邮箱")
    phone: Optional[str] = Field(default=None, max_length=50, description="留言人电话")
    company: Optional[str] = Field(default=None, max_length=200, description="留言人公司")
    subject: str = Field(..., max_length=200, description="留言主题")
    message: str = Field(..., description="留言正文")


class ContactProcessRequest(BaseModel):
    """后台客服处理请求"""
    remark: str = Field(..., description="客服处理备注")
    status: str = Field(default="processed", max_length=20, description="处理状态: read/processed")


class ContactResponse(BaseModel):
    """留言响应结构"""
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str
    status: str
    remark: Optional[str] = None
    processed_by: Optional[int] = None
    processed_by_username: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
