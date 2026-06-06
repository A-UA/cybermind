"""数据库种子数据 — 初始化超级管理员和预置权限"""
from sqlmodel import Session, select
from app.core.database import engine
from app.core.security import hash_password
from app.models.user import SysUser, SysRole, SysPermission, SysUserRole, SysRolePermission

# 预置权限列表
PRESET_PERMISSIONS = [
    ("user:create", "创建用户", "user"),
    ("user:read", "查看用户", "user"),
    ("user:update", "更新用户", "user"),
    ("user:delete", "删除用户", "user"),
    ("role:create", "创建角色", "role"),
    ("role:read", "查看角色", "role"),
    ("role:update", "更新角色", "role"),
    ("role:delete", "删除角色", "role"),
    ("banner:create", "创建Banner", "banner"),
    ("banner:read", "查看Banner", "banner"),
    ("banner:update", "更新Banner", "banner"),
    ("banner:delete", "删除Banner", "banner"),
    ("news:create", "创建新闻", "news"),
    ("news:read", "查看新闻", "news"),
    ("news:update", "更新新闻", "news"),
    ("news:delete", "删除新闻", "news"),
    ("contact:read", "查看联系表单", "contact"),
    ("contact:update", "处理联系表单", "contact"),
    ("contact:delete", "删除联系表单", "contact"),
    ("help:create", "创建帮助内容", "help"),
    ("help:read", "查看帮助内容", "help"),
    ("help:update", "更新帮助内容", "help"),
    ("help:delete", "删除帮助内容", "help"),
    ("video:create", "上传视频", "video"),
    ("video:read", "查看视频", "video"),
    ("video:update", "更新视频", "video"),
    ("video:delete", "删除视频", "video"),
    ("config:read", "查看站点配置", "config"),
    ("config:update", "更新站点配置", "config"),
    ("stats:read", "查看数据统计", "stats"),
]

# 预置角色
PRESET_ROLES = [
    ("super_admin", "超级管理员", "拥有系统所有权限"),
    ("content_admin", "内容管理员", "管理Banner/新闻/帮助/视频内容"),
    ("customer_service", "客服", "处理联系表单"),
]

# 角色-权限映射
ROLE_PERMISSIONS = {
    "super_admin": ["*"],  # 所有权限
    "content_admin": [
        "banner:create", "banner:read", "banner:update", "banner:delete",
        "news:create", "news:read", "news:update", "news:delete",
        "help:create", "help:read", "help:update", "help:delete",
        "video:create", "video:read", "video:update", "video:delete",
    ],
    "customer_service": ["contact:read", "contact:update"],
}


def seed_database():
    """初始化数据库种子数据"""
    with Session(engine) as session:
        # 1. 创建权限
        existing_perms = session.exec(select(SysPermission)).all()
        existing_perm_codes = {p.code for p in existing_perms}

        all_permissions = {}
        for code, name, module in PRESET_PERMISSIONS:
            if code not in existing_perm_codes:
                perm = SysPermission(code=code, name=name, module=module)
                session.add(perm)
                session.flush()
                all_permissions[code] = perm
            else:
                perm = next(p for p in existing_perms if p.code == code)
                all_permissions[code] = perm

        # 2. 创建角色并分配权限
        existing_roles = session.exec(select(SysRole)).all()
        existing_role_codes = {r.code for r in existing_roles}

        for code, name, description in PRESET_ROLES:
            if code not in existing_role_codes:
                role = SysRole(code=code, name=name, description=description)
                session.add(role)
                session.flush()

                # 分配权限
                perm_codes = ROLE_PERMISSIONS.get(code, [])
                if "*" in perm_codes:
                    perm_codes = list(all_permissions.keys())

                for perm_code in perm_codes:
                    if perm_code in all_permissions:
                        link = SysRolePermission(
                            role_id=role.id,
                            permission_id=all_permissions[perm_code].id,
                        )
                        session.add(link)

        # 3. 创建超级管理员账号
        admin = session.exec(
            select(SysUser).where(SysUser.username == "admin")
        ).first()

        if not admin:
            admin = SysUser(
                username="admin",
                nickname="超级管理员",
                hashed_password=hash_password("admin123"),
                is_active=True,
            )
            session.add(admin)
            session.flush()

            # 分配超级管理员角色
            super_role = session.exec(
                select(SysRole).where(SysRole.code == "super_admin")
            ).first()
            if super_role:
                link = SysUserRole(user_id=admin.id, role_id=super_role.id)
                session.add(link)

        # 4. 初始化预置站点配置项
        from app.models.site_config import SiteConfig
        
        PRESET_CONFIGS = [
            ("site_name", "CyberMind 官网", "text", "站点名称"),
            ("site_logo", "", "image", "站点LOGO"),
            ("contact_phone", "13800138000", "text", "手机号"),
            ("contact_email", "contact@cybermind.com", "text", "邮箱"),
            ("qr_code_image", "", "image", "二维码图片URL"),
        ]
        
        for key, value, config_type, description in PRESET_CONFIGS:
            config = session.exec(
                select(SiteConfig).where(SiteConfig.config_key == key)
            ).first()
            if not config:
                config = SiteConfig(
                    config_key=key,
                    config_value=value,
                    config_type=config_type,
                    description=description
                )
                session.add(config)

        session.commit()
        print("种子数据初始化完成")

