"""联系我们留言管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional, List

from app.core.database import get_session
from app.core.deps import require_permission
from app.models.user import SysUser
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.contact import ContactSubmitRequest, ContactProcessRequest, ContactResponse
from app.services import contact as contact_service

router = APIRouter(prefix="/contact-submissions", tags=["联系我们"])


@router.post("", response_model=ApiResponse[ContactResponse])
async def submit_contact(
    body: ContactSubmitRequest,
    session: Session = Depends(get_session)
):
    """前台用户提交留言 (公开接口)"""
    submission = contact_service.create_submission(session, body)
    # 刚提交的留言没有被处理，所以 processed_by_username 为 None
    data = ContactResponse.model_validate(submission)
    return ApiResponse(data=data, message="留言提交成功")


@router.get("", response_model=ApiResponse[PaginatedData[ContactResponse]],
            dependencies=[Depends(require_permission("contact:read"))])
async def list_contact_submissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    query: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """客服分页查询留言列表 (带状态筛选与关键字搜索)"""
    submissions, total = contact_service.get_contact_submissions(
        session, page, page_size, status_filter, query
    )
    items = [ContactResponse(**s) for s in submissions]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.get("/{id}", response_model=ApiResponse[ContactResponse],
            dependencies=[Depends(require_permission("contact:read"))])
async def get_contact_submission(
    id: int,
    session: Session = Depends(get_session)
):
    """获取单个留言详情 (未读留言在查询时会自动变更为已读 read)"""
    sub_dict = contact_service.get_submission_by_id(session, id)
    return ApiResponse(data=ContactResponse(**sub_dict))


@router.put("/{id}/process", response_model=ApiResponse[ContactResponse])
async def process_contact_submission(
    id: int,
    body: ContactProcessRequest,
    current_user: SysUser = Depends(require_permission("contact:update")),
    session: Session = Depends(get_session)
):
    """客服批注处理留言，标记状态"""
    sub_dict = contact_service.process_submission(session, id, current_user.id, body)
    return ApiResponse(data=ContactResponse(**sub_dict), message="留言处理归档成功")


@router.delete("/{id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("contact:delete"))])
async def delete_contact_submission(
    id: int,
    session: Session = Depends(get_session)
):
    """物理删除留言记录"""
    contact_service.delete_submission(session, id)
    return ApiResponse(message="留言记录已成功物理擦除")
