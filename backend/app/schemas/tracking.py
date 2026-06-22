"""数据埋点 Pydantic 校验模式"""
from pydantic import Field
from app.schemas.common import BaseModel


class TrackingEventRequest(BaseModel):
    """埋点数据上报请求参数"""
    page_path: str = Field(..., max_length=500, description="访问的页面路径")
