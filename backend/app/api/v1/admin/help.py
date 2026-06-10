"""帮助中心常见问题管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import List, Optional

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse
from app.schemas.help import (
    CategoryResponse, CategoryCreate, CategoryUpdate,
    QuestionResponse, QuestionCreate, QuestionUpdate
)
from app.services import help as help_service

router = APIRouter(prefix="/help", tags=["帮助中心"])


# --- 分类控制端点 ---

@router.get("/categories", response_model=ApiResponse[List[CategoryResponse]],
            dependencies=[Depends(require_permission("help:read"))], summary="获取分类列表")
async def list_categories(session: Session = Depends(get_session)):
    """获取所有帮助中心分类列表"""
    categories = help_service.get_all_categories(session)
    items = [
        CategoryResponse(
            id=c.id,
            name=c.name,
            sort_order=c.sort_order,
            created_at=c.created_at
        ) for c in categories
    ]
    return ApiResponse(data=items)


@router.post("/categories", response_model=ApiResponse[CategoryResponse],
             dependencies=[Depends(require_permission("help:create"))], summary="创建分类")
async def create_category(body: CategoryCreate, session: Session = Depends(get_session)):
    """创建分类"""
    category = help_service.create_category(session, body)
    return ApiResponse(
        data=CategoryResponse(
            id=category.id,
            name=category.name,
            sort_order=category.sort_order,
            created_at=category.created_at
        ),
        message="分类创建成功"
    )


@router.put("/categories/{id}", response_model=ApiResponse[CategoryResponse],
            dependencies=[Depends(require_permission("help:update"))], summary="更新分类")
async def update_category(id: int, body: CategoryUpdate, session: Session = Depends(get_session)):
    """更新分类属性"""
    category = help_service.update_category(session, id, body)
    return ApiResponse(
        data=CategoryResponse(
            id=category.id,
            name=category.name,
            sort_order=category.sort_order,
            created_at=category.created_at
        ),
        message="分类更新成功"
    )


@router.delete("/categories/{id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("help:delete"))], summary="删除分类")
async def delete_category(id: int, session: Session = Depends(get_session)):
    """删除分类"""
    help_service.delete_category(session, id)
    return ApiResponse(message="分类删除成功")


# --- 问答控制端点 ---

@router.get("/questions", response_model=ApiResponse[List[QuestionResponse]],
            dependencies=[Depends(require_permission("help:read"))], summary="获取问答列表")
async def list_questions(
    category_id: Optional[int] = Query(None),
    query: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """获取帮助中心问答列表 (支持按分类ID筛选、问题关键字搜索)"""
    questions = help_service.get_questions(session, category_id, query)
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
            updated_at=q.updated_at
        ) for q in questions
    ]
    return ApiResponse(data=items)


@router.post("/questions", response_model=ApiResponse[QuestionResponse], summary="创建问答")
async def create_question(
    body: QuestionCreate,
    current_user: SysUser = Depends(require_permission("help:create")),
    session: Session = Depends(get_session)
):
    """创建问答内容"""
    question = help_service.create_question(session, body, current_user.id)
    return ApiResponse(
        data=QuestionResponse(
            id=question.id,
            category_id=question.category_id,
            question=question.question,
            answer=question.answer,
            sort_order=question.sort_order,
            is_active=question.is_active,
            created_by=question.created_by,
            created_at=question.created_at,
            updated_at=question.updated_at
        ),
        message="问答内容添加成功"
    )


@router.put("/questions/{id}", response_model=ApiResponse[QuestionResponse],
            dependencies=[Depends(require_permission("help:update"))], summary="更新问答")
async def update_question(
    id: int,
    body: QuestionUpdate,
    session: Session = Depends(get_session)
):
    """更新问答内容"""
    question = help_service.update_question(session, id, body)
    return ApiResponse(
        data=QuestionResponse(
            id=question.id,
            category_id=question.category_id,
            question=question.question,
            answer=question.answer,
            sort_order=question.sort_order,
            is_active=question.is_active,
            created_by=question.created_by,
            created_at=question.created_at,
            updated_at=question.updated_at
        ),
        message="问答内容更新成功"
    )


@router.delete("/questions/{id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("help:delete"))], summary="删除问答")
async def delete_question(id: int, session: Session = Depends(get_session)):
    """删除问答"""
    help_service.delete_question(session, id)
    return ApiResponse(message="问答删除成功")
