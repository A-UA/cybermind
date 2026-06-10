"""文件上传路由"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File
from app.core.deps import get_current_user
from app.core.exceptions import BadRequestException
from app.schemas.common import ApiResponse
from app.storage import get_storage
from app.models.user import SysUser

router = APIRouter(prefix="/upload", tags=["文件上传"])

# 允许的文件类型
IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "svg"}
VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "avi"}
FILE_EXTENSIONS = {"pdf", "doc", "docx", "xls", "xlsx"}

# 文件大小限制（字节）
IMAGE_MAX_SIZE = 10 * 1024 * 1024       # 10 MB
VIDEO_MAX_SIZE = 500 * 1024 * 1024      # 500 MB
FILE_MAX_SIZE = 50 * 1024 * 1024        # 50 MB


def _get_extension(filename: str) -> str:
    """获取文件扩展名"""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _generate_path(file_type: str, filename: str) -> str:
    """生成存储路径"""
    now = datetime.utcnow()
    ext = _get_extension(filename)
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return f"{file_type}/{now.year}/{now.month:02d}/{unique_name}"


@router.post("/image", response_model=ApiResponse[dict])
async def upload_image(
    file: UploadFile = File(...),
    current_user: SysUser = Depends(get_current_user),
):
    """上传图片"""
    ext = _get_extension(file.filename or "")
    if ext not in IMAGE_EXTENSIONS:
        raise BadRequestException(f"不支持的图片格式: {ext}")

    # 检查大小
    content = await file.read()
    if len(content) > IMAGE_MAX_SIZE:
        raise BadRequestException("图片大小不能超过 10MB")
    await file.seek(0)

    storage = get_storage()
    path = _generate_path("images", file.filename or "upload.jpg")
    url = await storage.upload(file, path)

    return ApiResponse(data={"url": url, "path": path})


@router.post("/video", response_model=ApiResponse[dict])
async def upload_video(
    file: UploadFile = File(...),
    current_user: SysUser = Depends(get_current_user),
):
    """上传视频"""
    ext = _get_extension(file.filename or "")
    if ext not in VIDEO_EXTENSIONS:
        raise BadRequestException(f"不支持的视频格式: {ext}")

    content = await file.read()
    if len(content) > VIDEO_MAX_SIZE:
        raise BadRequestException("视频大小不能超过 500MB")
    await file.seek(0)

    storage = get_storage()
    path = _generate_path("videos", file.filename or "upload.mp4")
    url = await storage.upload(file, path)

    return ApiResponse(data={"url": url, "path": path})


@router.post("/file", response_model=ApiResponse[dict])
async def upload_file(
    file: UploadFile = File(...),
    current_user: SysUser = Depends(get_current_user),
):
    """上传通用文件"""
    ext = _get_extension(file.filename or "")
    if ext not in FILE_EXTENSIONS:
        raise BadRequestException(f"不支持的文件格式: {ext}")

    content = await file.read()
    if len(content) > FILE_MAX_SIZE:
        raise BadRequestException("文件大小不能超过 50MB")
    await file.seek(0)

    storage = get_storage()
    path = _generate_path("files", file.filename or "upload.bin")
    url = await storage.upload(file, path)

    return ApiResponse(data={"url": url, "path": path})
