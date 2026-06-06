"""帮助中心 Pydantic 架构模型"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# --- 分类 Schemas ---

class CategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100, description="分类名称")
    sort_order: int = Field(0, description="排序序号，越小越靠前")


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="分类名称")
    sort_order: Optional[int] = Field(None, description="排序序号")


# --- 问题 Schemas ---

class QuestionResponse(BaseModel):
    id: int
    category_id: int
    question: str
    answer: str
    sort_order: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class QuestionCreate(BaseModel):
    category_id: int = Field(..., description="所属分类ID")
    question: str = Field(..., max_length=500, description="常见问题")
    answer: str = Field(..., description="回答内容(富文本)")
    sort_order: int = Field(0, description="排序序号")
    is_active: bool = Field(True, description="是否启用")


class QuestionUpdate(BaseModel):
    category_id: Optional[int] = Field(None, description="所属分类ID")
    question: Optional[str] = Field(None, max_length=500, description="常见问题")
    answer: Optional[str] = Field(None, description="回答内容(富文本)")
    sort_order: Optional[int] = Field(None, description="排序序号")
    is_active: Optional[bool] = Field(None, description="是否启用")
