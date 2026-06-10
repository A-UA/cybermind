"""官网公开帮助中心接口"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.schemas.help import CategoryResponse, QuestionResponse
from app.services import help as help_service

router = APIRouter(prefix="/help", tags=["公开-帮助中心"])


@router.get("/categories", response_model=ApiResponse[list[CategoryResponse]])
async def list_public_categories(session: Session = Depends(get_session)):
    """获取帮助中心分类列表"""
    categories = help_service.get_all_categories(session)
    items = [
        CategoryResponse(
            id=c.id, name=c.name, sort_order=c.sort_order, created_at=c.created_at
        )
        for c in categories
    ]
    return ApiResponse(data=items)


@router.get("/questions", response_model=ApiResponse[list[QuestionResponse]])
async def list_public_questions(
    category_id: int | None = Query(None),
    session: Session = Depends(get_session),
):
    """获取公开常见问题列表（仅已启用的，可选按分类过滤）"""
    questions = help_service.get_public_questions(session, category_id)
    items = [
        QuestionResponse(
            id=q.id,
            category_id=q.category_id,
            question=q.question,
            answer=q.answer,
            sort_order=q.sort_order,
            is_active=q.is_active,
            created_by=q.created_by,
            created_at=q.created_at,
            updated_at=q.updated_at,
        )
        for q in questions
    ]
    return ApiResponse(data=items)
