"""联系我们留言业务逻辑服务"""
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException, status
from typing import List, Tuple, Optional

from app.models.contact import ContactSubmission
from app.models.user import SysUser
from app.schemas.contact import ContactSubmitRequest, ContactProcessRequest


def create_submission(session: Session, body: ContactSubmitRequest) -> ContactSubmission:
    """前台提交留言，状态默认为 unread"""
    submission = ContactSubmission(
        name=body.name,
        email=body.email,
        phone=body.phone,
        company=body.company,
        subject=body.subject,
        message=body.message,
        status="unread"
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


def get_contact_submissions(
    session: Session,
    page: int,
    page_size: int,
    status_filter: Optional[str] = None,
    query: Optional[str] = None
) -> Tuple[List[dict], int]:
    """获取分页的留言列表，按创建时间倒序排列，联表查询客服用户名"""
    stmt = select(ContactSubmission, SysUser.username).outerjoin(
        SysUser, ContactSubmission.processed_by == SysUser.id
    )

    if status_filter:
        stmt = stmt.where(ContactSubmission.status == status_filter)
    if query:
        stmt = stmt.where(
            (ContactSubmission.name.like(f"%{query}%"))
            | (ContactSubmission.email.like(f"%{query}%"))
            | (ContactSubmission.subject.like(f"%{query}%"))
            | (ContactSubmission.message.like(f"%{query}%"))
        )

    # 计算总数
    total = len(session.exec(stmt).all())

    # 排序与分页
    stmt = stmt.order_by(ContactSubmission.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    results = session.exec(stmt).all()

    items = []
    for sub, username in results:
        sub_dict = sub.model_dump()
        sub_dict["processed_by_username"] = username
        items.append(sub_dict)

    return items, total


def get_submission_by_id(session: Session, id: int) -> dict:
    """查询单个留言。如果是 unread 状态则自动将其变更为 read"""
    # 先做联表查询
    stmt = select(ContactSubmission, SysUser.username).outerjoin(
        SysUser, ContactSubmission.processed_by == SysUser.id
    ).where(ContactSubmission.id == id)

    res = session.exec(stmt).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"留言 ID #{id} 不存在"
        )

    sub, username = res
    if sub.status == "unread":
        sub.status = "read"
        session.add(sub)
        session.commit()
        session.refresh(sub)

    sub_dict = sub.model_dump()
    sub_dict["processed_by_username"] = username
    return sub_dict


def process_submission(
    session: Session,
    id: int,
    processed_by: int,
    body: ContactProcessRequest
) -> dict:
    """客服批注处理留言，流转状态"""
    submission = session.exec(select(ContactSubmission).where(ContactSubmission.id == id)).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"留言 ID #{id} 不存在"
        )

    submission.remark = body.remark
    submission.status = body.status
    submission.processed_by = processed_by
    submission.processed_at = datetime.utcnow()
    submission.updated_at = datetime.utcnow()

    session.add(submission)
    session.commit()
    session.refresh(submission)

    # 查出用户名返回
    user = session.exec(select(SysUser).where(SysUser.id == processed_by)).first()
    sub_dict = submission.model_dump()
    sub_dict["processed_by_username"] = user.username if user else None
    return sub_dict


def delete_submission(session: Session, id: int):
    """物理删除留言"""
    submission = session.exec(select(ContactSubmission).where(ContactSubmission.id == id)).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"留言 ID #{id} 不存在"
        )
    session.delete(submission)
    session.commit()
