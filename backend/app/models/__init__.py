"""数据模型包 — 在此统一导入所有模型，确保 Alembic 能发现"""
from app.models.user import SysUser, SysRole, SysPermission, SysUserRole, SysRolePermission
from app.models.banner import Banner
from app.models.site_config import SiteConfig
from app.models.news import NewsArticle
from app.models.help import HelpCategory, HelpQuestion
from app.models.video import OperationVideo
from app.models.contact import ContactSubmission



