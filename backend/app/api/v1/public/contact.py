"""官网公开联系我们接口"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.common import ApiResponse
from app.schemas.contact import ContactSubmitRequest, ContactResponse
from app.services import contact as contact_service

router = APIRouter(prefix="/contact", tags=["公开-联系我们"])


@router.post("", response_model=ApiResponse[ContactResponse])
async def submit_public_contact(
    body: ContactSubmitRequest,
    session: Session = Depends(get_session),
):
    """前台用户提交留言（公开接口，无需登录）"""
    submission = contact_service.create_submission(session, body)
    data = ContactResponse.model_validate(submission)
    return ApiResponse(data=data, message="留言提交成功")
