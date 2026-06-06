"""站点配置 Pydantic 架构模型"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict


class SiteConfigResponse(BaseModel):
    id: int
    config_key: str
    config_value: str
    config_type: str
    description: Optional[str] = None
    updated_at: datetime
    updated_by: Optional[int] = None

    model_config = {
        "from_attributes": True
    }


class SiteConfigUpdate(BaseModel):
    config_value: str = Field(..., description="配置值")
    description: Optional[str] = Field(None, max_length=255, description="配置描述")


class SiteConfigBatchUpdate(BaseModel):
    configs: Dict[str, str] = Field(..., description="配置键值对字典")
