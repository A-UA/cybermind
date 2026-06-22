"""帮助中心业务逻辑服务"""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.help import HelpCategory, HelpQuestion
from app.schemas.help import (
    CategoryCreate,
    CategoryUpdate,
    QuestionCreate,
    QuestionUpdate,
)

# --- 分类管理服务 ---


def get_all_categories(session: Session) -> List[HelpCategory]:
    """获取所有分类，默认按 sort_order 升序，创建时间降序排序"""
    query = select(HelpCategory).order_by(
        HelpCategory.sort_order.asc(), HelpCategory.created_at.desc()
    )
    return session.exec(query).all()


def get_category_by_id(session: Session, id: int) -> HelpCategory:
    """获取分类详情"""
    category = session.exec(select(HelpCategory).where(HelpCategory.id == id)).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"分类 ID #{id} 不存在"
        )
    return category


def create_category(session: Session, body: CategoryCreate) -> HelpCategory:
    """创建分类"""
    category = HelpCategory(name=body.name, sort_order=body.sort_order)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def update_category(session: Session, id: int, body: CategoryUpdate) -> HelpCategory:
    """更新分类"""
    category = get_category_by_id(session, id)
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete_category(session: Session, id: int):
    """删除分类 (若该分类下包含问答，则阻止删除)"""
    category = get_category_by_id(session, id)

    # 拦截：检查是否有关联问答
    has_questions = session.exec(
        select(HelpQuestion).where(HelpQuestion.category_id == id)
    ).first()
    if has_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该分类下还绑定了常见问题解答，请先删除或迁移关联的问答后，再删除该分类。",
        )

    session.delete(category)
    session.commit()


# --- 问题管理服务 ---


def get_questions(
    session: Session, category_id: Optional[int] = None, query_str: Optional[str] = None
) -> List[HelpQuestion]:
    """获取问答列表，默认按 sort_order 升序，创建时间降序排序"""
    query = select(HelpQuestion)

    if category_id is not None:
        query = query.where(HelpQuestion.category_id == category_id)
    if query_str:
        query = query.where(HelpQuestion.question.like(f"%{query_str}%"))

    query = query.order_by(
        HelpQuestion.sort_order.asc(), HelpQuestion.created_at.desc()
    )
    return session.exec(query).all()


def get_question_by_id(session: Session, id: int) -> HelpQuestion:
    """根据 ID 获取问答详情"""
    question = session.exec(select(HelpQuestion).where(HelpQuestion.id == id)).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"问答 ID #{id} 不存在"
        )
    return question


def create_question(
    session: Session, body: QuestionCreate, author_id: int
) -> HelpQuestion:
    """添加问答，验证分类是否存在"""
    get_category_by_id(session, body.category_id)  # 验证外键存在

    question = HelpQuestion(
        category_id=body.category_id,
        question=body.question,
        answer=body.answer,
        sort_order=body.sort_order,
        is_active=body.is_active,
        created_by=author_id,
    )
    # created_at/updated_at 由 TimestampMixin 的 default_factory 自动填充
    session.add(question)
    session.commit()
    session.refresh(question)
    return question


def update_question(session: Session, id: int, body: QuestionUpdate) -> HelpQuestion:
    """修改问答属性"""
    question = get_question_by_id(session, id)

    if body.category_id is not None:
        get_category_by_id(session, body.category_id)  # 验证新外键

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)

    # updated_at 由 TimestampMixin 的 before_update 事件自动设置
    session.add(question)
    session.commit()
    session.refresh(question)
    return question


def delete_question(session: Session, id: int):
    """物理删除问答"""
    question = get_question_by_id(session, id)
    session.delete(question)
    session.commit()


def get_public_questions(
    session: Session,
    category_id: int | None = None,
) -> list[HelpQuestion]:
    """获取公开问题列表（仅已启用的，可选按分类过滤，按 sort_order 排序）"""
    query = select(HelpQuestion).where(HelpQuestion.is_active == True)

    if category_id is not None:
        query = query.where(HelpQuestion.category_id == category_id)

    query = query.order_by(
        HelpQuestion.sort_order.asc(), HelpQuestion.created_at.desc()
    )
    return session.exec(query).all()
