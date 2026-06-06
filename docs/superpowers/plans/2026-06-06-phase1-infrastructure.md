# CyberMind CMS 阶段一：基础设施实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 CyberMind CMS 后台管理系统的基础设施，包括项目脚手架、数据库设计、认证系统、RBAC 权限系统、文件存储抽象和前端基础布局，使后续业务模块可以在此基础上快速开发。

**Architecture:** Monorepo 前后端分离架构。后端 FastAPI + SQLModel + MySQL，通过 Alembic 管理数据库迁移。前端 React 19 + TypeScript + Tailwind CSS 4.x + shadcn/ui。Docker Compose 编排所有服务。

**Tech Stack:** Python 3.12+ / FastAPI / uv / SQLModel / MySQL 8.0 / Alembic / React 19 / TypeScript / Vite / Tailwind CSS 4.x / shadcn/ui / Zustand / Axios / TanStack Query / React Router v7 / Docker Compose

---

## Task 1: 后端项目脚手架

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 uv 后端项目**

```bash
cd d:\codes\cybermind
mkdir backend
cd backend
uv init --name cybermind-backend
```

- [ ] **Step 2: 安装后端核心依赖**

```bash
cd d:\codes\cybermind\backend
uv add fastapi[standard] uvicorn[standard] sqlmodel pymysql alembic passlib[bcrypt] python-jose[cryptography] python-multipart python-dotenv
```

- [ ] **Step 3: 创建应用配置文件 `backend/app/core/config.py`**

```python
"""应用配置模块 — 通过环境变量加载配置"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    # 应用
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # 数据库
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "cybermind"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "cybermind"

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # 文件存储
    STORAGE_BACKEND: str = "local"
    UPLOAD_DIR: str = "./uploads"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET_IMAGES: str = "cybermind-images"
    MINIO_BUCKET_VIDEOS: str = "cybermind-videos"
    MINIO_USE_SSL: bool = False

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
```

- [ ] **Step 4: 创建 FastAPI 入口 `backend/app/main.py`**

```python
"""FastAPI 应用入口 — 仅负责初始化，禁止放业务逻辑"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    app = FastAPI(
        title="CyberMind CMS",
        description="CyberMind 后台管理系统 API",
        version="1.0.0",
        docs_url="/api/docs" if settings.APP_DEBUG else None,
        redoc_url="/api/redoc" if settings.APP_DEBUG else None,
    )

    # CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()


@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}
```

- [ ] **Step 5: 创建 `.env.example` 和 `.gitignore`**

`.env.example`:
```bash
# 数据库
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=cybermind
MYSQL_PASSWORD=cybermind123
MYSQL_DATABASE=cybermind

# JWT
JWT_SECRET_KEY=your-secret-key-at-least-32-characters
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# 应用
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:5173

# 文件存储
STORAGE_BACKEND=local
UPLOAD_DIR=./uploads

# MinIO（STORAGE_BACKEND=minio 时必填）
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_IMAGES=cybermind-images
MINIO_BUCKET_VIDEOS=cybermind-videos
MINIO_USE_SSL=false
```

`.gitignore`:
```
# 后端
backend/.venv/
backend/uploads/
backend/__pycache__/
**/__pycache__/
*.pyc
*.pyo

# 前端
frontend/node_modules/
frontend/dist/

# 环境变量
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统
.DS_Store
Thumbs.db

# Docker
docker-data/
```

- [ ] **Step 6: 创建 `__init__.py` 文件**

创建以下空文件：
- `backend/app/__init__.py`
- `backend/app/core/__init__.py`

- [ ] **Step 7: 验证后端启动**

```bash
cd d:\codes\cybermind\backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

预期：访问 `http://localhost:8000/api/health` 返回 `{"status": "ok"}`

- [ ] **Step 8: 提交**

```bash
cd d:\codes\cybermind
git init
git add .
git commit -m "feat: 初始化后端项目脚手架（FastAPI + uv）"
```

---

## Task 2: Docker Compose 编排

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.dev.yml`
- Create: `backend/Dockerfile`

- [ ] **Step 1: 创建 `docker-compose.yml`**

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: cybermind-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: cybermind
      MYSQL_USER: cybermind
      MYSQL_PASSWORD: cybermind123
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    container_name: cybermind-minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cybermind-backend
    env_file: .env
    ports:
      - "8000:8000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend/uploads:/app/uploads

volumes:
  mysql-data:
  minio-data:
```

- [ ] **Step 2: 创建 `docker-compose.dev.yml`**

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    volumes:
      - ./backend:/app
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- [ ] **Step 3: 创建 `backend/Dockerfile`**

```dockerfile
# 开发阶段
FROM python:3.12-slim AS development

WORKDIR /app

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 复制依赖文件
COPY pyproject.toml uv.lock ./

# 安装依赖
RUN uv sync --frozen

# 复制代码
COPY . .

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# 生产阶段
FROM python:3.12-slim AS production

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

- [ ] **Step 4: 创建 `.env` 开发文件**

```bash
cd d:\codes\cybermind
copy .env.example .env
```

将 `.env` 中的 `MYSQL_HOST` 改为 `localhost`（本地开发）或 `mysql`（Docker 内）。

- [ ] **Step 5: 验证 Docker Compose 启动**

```bash
cd d:\codes\cybermind
docker compose up mysql minio -d
```

预期：MySQL 在 3306 端口可连接，MinIO Console 在 `http://localhost:9001` 可访问。

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: 添加 Docker Compose 编排（MySQL + MinIO）"
```

---

## Task 3: 数据库模型与 Alembic 迁移

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/core/database.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

- [ ] **Step 1: 创建数据库会话管理 `backend/app/core/database.py`**

```python
"""数据库连接与会话管理"""
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)


def get_session():
    """获取数据库会话（用于 FastAPI 依赖注入）"""
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """创建所有表（仅开发/测试用，生产环境使用 Alembic）"""
    SQLModel.metadata.create_all(engine)
```

- [ ] **Step 2: 创建用户/角色/权限模型 `backend/app/models/user.py`**

```python
"""用户、角色、权限相关数据模型 — 基础设施表（sys_ 前缀）"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class SysUserRole(SQLModel, table=True):
    """用户-角色关联表"""
    __tablename__ = "sys_user_roles"

    user_id: int = Field(foreign_key="sys_users.id", primary_key=True)
    role_id: int = Field(foreign_key="sys_roles.id", primary_key=True)


class SysRolePermission(SQLModel, table=True):
    """角色-权限关联表"""
    __tablename__ = "sys_role_permissions"

    role_id: int = Field(foreign_key="sys_roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="sys_permissions.id", primary_key=True)


class SysUser(SQLModel, table=True):
    """用户表"""
    __tablename__ = "sys_users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True, description="登录账号")
    nickname: Optional[str] = Field(default=None, max_length=50, description="显示昵称")
    email: Optional[str] = Field(default=None, max_length=100, unique=True, description="邮箱")
    hashed_password: str = Field(max_length=255, description="密码哈希")
    is_active: bool = Field(default=True, description="是否启用")
    avatar: Optional[str] = Field(default=None, max_length=500, description="头像URL")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="更新时间")

    # 关系
    roles: list["SysRole"] = Relationship(back_populates="users", link_model=SysUserRole)


class SysRole(SQLModel, table=True):
    """角色表"""
    __tablename__ = "sys_roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, description="角色名称")
    code: str = Field(max_length=50, unique=True, description="角色代码")
    description: Optional[str] = Field(default=None, max_length=255, description="角色描述")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")

    # 关系
    users: list[SysUser] = Relationship(back_populates="roles", link_model=SysUserRole)
    permissions: list["SysPermission"] = Relationship(back_populates="roles", link_model=SysRolePermission)


class SysPermission(SQLModel, table=True):
    """权限表"""
    __tablename__ = "sys_permissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(max_length=100, unique=True, description="权限代码，如 banner:create")
    name: str = Field(max_length=100, description="权限名称")
    module: str = Field(max_length=50, description="所属模块")

    # 关系
    roles: list[SysRole] = Relationship(back_populates="permissions", link_model=SysRolePermission)
```

- [ ] **Step 3: 创建模型包导出 `backend/app/models/__init__.py`**

```python
"""数据模型包 — 在此统一导入所有模型，确保 Alembic 能发现"""
from app.models.user import SysUser, SysRole, SysPermission, SysUserRole, SysRolePermission
```

- [ ] **Step 4: 初始化 Alembic**

```bash
cd d:\codes\cybermind\backend
uv run alembic init alembic
```

- [ ] **Step 5: 修改 `backend/alembic.ini` 数据库连接**

将 `sqlalchemy.url` 行注释掉（改为从 env.py 动态读取）：

```ini
# sqlalchemy.url = driver://user:pass@localhost/dbname
```

- [ ] **Step 6: 修改 `backend/alembic/env.py`**

修改关键部分：

```python
# 在文件顶部添加
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.models import *  # noqa: F401,F403  确保所有模型被导入
from sqlmodel import SQLModel

# 设置 target_metadata
target_metadata = SQLModel.metadata

# 在 run_migrations_online() 函数中修改 URL
def run_migrations_online():
    from sqlalchemy import engine_from_config, pool
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()
```

- [ ] **Step 7: 生成第一个迁移文件**

```bash
cd d:\codes\cybermind\backend
uv run alembic revision --autogenerate -m "初始化用户角色权限表"
```

预期：在 `alembic/versions/` 下生成迁移文件，包含 `sys_users`、`sys_roles`、`sys_permissions`、`sys_user_roles`、`sys_role_permissions` 五张表。

- [ ] **Step 8: 执行迁移**

```bash
cd d:\codes\cybermind\backend
uv run alembic upgrade head
```

预期：数据库中成功创建 5 张 `sys_` 前缀表。

- [ ] **Step 9: 提交**

```bash
git add .
git commit -m "feat: 初始化数据库模型与 Alembic 迁移（用户/角色/权限）"
```

---

## Task 4: 安全核心 — JWT 与密码加密

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/core/exceptions.py`

- [ ] **Step 1: 创建安全模块 `backend/app/core/security.py`**

```python
"""JWT Token 与密码加密工具"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """对明文密码进行 bcrypt 哈希"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码与哈希是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """创建 access_token"""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """创建 refresh_token"""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """解码 JWT Token，失败抛出 JWTError"""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
```

- [ ] **Step 2: 创建异常体系 `backend/app/core/exceptions.py`**

```python
"""统一异常定义"""
from fastapi import HTTPException, status


class AppException(HTTPException):
    """应用基础异常"""
    def __init__(self, code: int, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        super().__init__(status_code=status_code, detail=message)


class UnauthorizedException(AppException):
    """未认证异常"""
    def __init__(self, message: str = "未认证或 Token 已过期"):
        super().__init__(code=401, message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    """无权限异常"""
    def __init__(self, message: str = "无操作权限"):
        super().__init__(code=403, message=message, status_code=status.HTTP_403_FORBIDDEN)


class NotFoundException(AppException):
    """资源不存在异常"""
    def __init__(self, message: str = "资源不存在"):
        super().__init__(code=404, message=message, status_code=status.HTTP_404_NOT_FOUND)


class BadRequestException(AppException):
    """请求参数错误异常"""
    def __init__(self, message: str = "请求参数错误"):
        super().__init__(code=400, message=message, status_code=status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: 添加 JWT 安全模块与统一异常体系"
```

---

## Task 5: 依赖注入 — 鉴权与权限校验

**Files:**
- Create: `backend/app/core/deps.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/common.py`

- [ ] **Step 1: 创建统一响应 Schema `backend/app/schemas/common.py`**

```python
"""通用响应模式"""
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""
    code: int = 200
    message: str = "操作成功"
    data: Optional[T] = None


class PaginatedData(BaseModel, Generic[T]):
    """分页数据"""
    items: list[T]
    total: int
    page: int
    page_size: int


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    code: int = 200
    message: str = "操作成功"
    data: Optional[PaginatedData[T]] = None
```

- [ ] **Step 2: 创建 Schema 包导出 `backend/app/schemas/__init__.py`**

```python
"""Schema 模式包"""
from app.schemas.common import ApiResponse, PaginatedData, PaginatedResponse
```

- [ ] **Step 3: 创建依赖注入模块 `backend/app/core/deps.py`**

```python
"""FastAPI 依赖注入 — 鉴权、权限校验、数据库会话"""
from fastapi import Depends, Cookie, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from jose import JWTError

from app.core.database import get_session
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import SysUser

# Bearer Token 提取器
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    session: Session = Depends(get_session),
) -> SysUser:
    """从 JWT Token 中解析当前登录用户"""
    if not credentials:
        raise UnauthorizedException()

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedException("Token 类型无效")
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException()
    except JWTError:
        raise UnauthorizedException()

    user = session.get(SysUser, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("用户不存在或已被禁用")

    return user


def require_permission(*permissions: str):
    """权限校验依赖工厂 — 检查当前用户是否拥有指定权限

    用法：
        @router.get("/", dependencies=[Depends(require_permission("banner:read"))])
    """
    async def _check_permission(
        current_user: SysUser = Depends(get_current_user),
        session: Session = Depends(get_session),
    ) -> SysUser:
        # 获取用户的所有权限代码
        user_permissions = set()
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        # 检查是否拥有所需权限（需要满足全部）
        for perm in permissions:
            if perm not in user_permissions:
                raise ForbiddenException(f"缺少权限: {perm}")

        return current_user

    return _check_permission
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: 添加依赖注入模块（鉴权/权限校验/统一响应）"
```

---

## Task 6: 认证 API — 登录/刷新/登出

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/auth.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/v1/auth.py`
- Create: `backend/app/api/router.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: 创建认证 Schema `backend/app/schemas/auth.py`**

```python
"""认证相关请求/响应模式"""
from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., min_length=1, max_length=50, description="登录账号")
    password: str = Field(..., min_length=8, max_length=128, description="密码")


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"


class UserInfoResponse(BaseModel):
    """当前用户信息响应"""
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    roles: list[str] = []
    permissions: list[str] = []


class UpdateProfileRequest(BaseModel):
    """更新个人信息请求"""
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    avatar: Optional[str] = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    """修改密码请求"""
    old_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)
```

- [ ] **Step 2: 创建认证 Service `backend/app/services/auth.py`**

```python
"""认证业务逻辑层"""
from sqlmodel import Session, select
from app.models.user import SysUser
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException, BadRequestException

# 简单的内存黑名单（生产环境建议用 Redis）
_refresh_token_blacklist: set[str] = set()


def authenticate_user(session: Session, username: str, password: str) -> SysUser:
    """验证用户名和密码"""
    statement = select(SysUser).where(SysUser.username == username)
    user = session.exec(statement).first()
    if not user:
        raise UnauthorizedException("用户名或密码错误")
    if not user.is_active:
        raise UnauthorizedException("账号已被禁用")
    if not verify_password(password, user.hashed_password):
        raise UnauthorizedException("用户名或密码错误")
    return user


def create_tokens(user_id: int) -> dict:
    """为用户生成 access_token 和 refresh_token"""
    access_token = create_access_token(subject=str(user_id))
    refresh_token = create_refresh_token(subject=str(user_id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


def blacklist_refresh_token(token: str):
    """将 refresh_token 加入黑名单"""
    _refresh_token_blacklist.add(token)


def is_token_blacklisted(token: str) -> bool:
    """检查 refresh_token 是否在黑名单中"""
    return token in _refresh_token_blacklist
```

- [ ] **Step 3: 创建认证路由 `backend/app/api/v1/auth.py`**

```python
"""认证路由 — 登录/刷新Token/登出/个人信息"""
from fastapi import APIRouter, Depends, Response, Cookie
from sqlmodel import Session
from jose import JWTError

from app.core.database import get_session
from app.core.deps import get_current_user
from app.core.security import decode_token, hash_password, verify_password
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.schemas.common import ApiResponse
from app.schemas.auth import (
    LoginRequest, TokenResponse, UserInfoResponse,
    UpdateProfileRequest, ChangePasswordRequest,
)
from app.services.auth import (
    authenticate_user, create_tokens,
    blacklist_refresh_token, is_token_blacklisted,
)
from app.models.user import SysUser

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    body: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    """用户登录"""
    user = authenticate_user(session, body.username, body.password)
    tokens = create_tokens(user.id)

    # 设置 refresh_token 到 HTTP-Only Cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,  # 开发环境用 False，生产改 True
        samesite="lax",
        max_age=7 * 24 * 3600,  # 7天
    )

    return ApiResponse(data=TokenResponse(access_token=tokens["access_token"]))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(
    response: Response,
    refresh_token: str = Cookie(None),
    session: Session = Depends(get_session),
):
    """刷新 access_token"""
    if not refresh_token:
        raise UnauthorizedException("缺少 refresh_token")

    if is_token_blacklisted(refresh_token):
        raise UnauthorizedException("refresh_token 已失效")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Token 类型无效")
        user_id = payload.get("sub")
    except JWTError:
        raise UnauthorizedException("refresh_token 已过期或无效")

    user = session.get(SysUser, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("用户不存在或已被禁用")

    # 旧 token 加入黑名单，生成新 token
    blacklist_refresh_token(refresh_token)
    tokens = create_tokens(user.id)

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )

    return ApiResponse(data=TokenResponse(access_token=tokens["access_token"]))


@router.post("/logout", response_model=ApiResponse)
async def logout(
    response: Response,
    current_user: SysUser = Depends(get_current_user),
    refresh_token: str = Cookie(None),
):
    """登出 — 将 refresh_token 加入黑名单"""
    if refresh_token:
        blacklist_refresh_token(refresh_token)

    response.delete_cookie("refresh_token")
    return ApiResponse(message="登出成功")


@router.get("/me", response_model=ApiResponse[UserInfoResponse])
async def get_current_user_info(
    current_user: SysUser = Depends(get_current_user),
):
    """获取当前用户信息（含角色和权限列表）"""
    roles = [role.code for role in current_user.roles]
    permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            permissions.add(perm.code)

    return ApiResponse(data=UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        email=current_user.email,
        avatar=current_user.avatar,
        is_active=current_user.is_active,
        roles=roles,
        permissions=sorted(permissions),
    ))


@router.put("/me", response_model=ApiResponse[UserInfoResponse])
async def update_profile(
    body: UpdateProfileRequest,
    current_user: SysUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """更新当前用户个人信息"""
    if body.nickname is not None:
        current_user.nickname = body.nickname
    if body.email is not None:
        current_user.email = body.email
    if body.avatar is not None:
        current_user.avatar = body.avatar

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    roles = [role.code for role in current_user.roles]
    permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            permissions.add(perm.code)

    return ApiResponse(data=UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        nickname=current_user.nickname,
        email=current_user.email,
        avatar=current_user.avatar,
        is_active=current_user.is_active,
        roles=roles,
        permissions=sorted(permissions),
    ))
```

- [ ] **Step 4: 创建路由汇总 `backend/app/api/router.py`**

```python
"""API 路由汇总"""
from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
```

- [ ] **Step 5: 在 `main.py` 中注册路由和异常处理器**

修改 `backend/app/main.py`，在 `create_app()` 中添加：

```python
from app.api.router import api_router
from app.core.exceptions import AppException
from fastapi.responses import JSONResponse
from fastapi import Request

def create_app() -> FastAPI:
    app = FastAPI(...)

    # CORS ...（保留原有代码）

    # 注册路由
    app.include_router(api_router)

    # 统一异常处理
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message, "data": None},
        )

    return app
```

- [ ] **Step 6: 创建 `__init__.py` 文件**

创建以下空文件：
- `backend/app/services/__init__.py`
- `backend/app/api/__init__.py`
- `backend/app/api/v1/__init__.py`

- [ ] **Step 7: 创建数据库种子脚本 `backend/app/core/seed.py`**

```python
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

        session.commit()
        print("种子数据初始化完成")
```

- [ ] **Step 8: 在 main.py 中添加启动事件调用种子数据**

在 `create_app()` 函数中添加 lifespan：

```python
from contextlib import asynccontextmanager
from app.core.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化种子数据
    seed_database()
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        lifespan=lifespan,
        ...
    )
```

- [ ] **Step 9: 验证认证 API**

```bash
cd d:\codes\cybermind\backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

测试接口：
1. `POST /api/v1/auth/login` — body: `{"username": "admin", "password": "admin123"}`
2. `GET /api/v1/auth/me` — header: `Authorization: Bearer <token>`

- [ ] **Step 10: 提交**

```bash
git add .
git commit -m "feat: 实现认证系统（登录/刷新Token/登出/个人信息）"
```

---

## Task 7: 用户管理 CRUD API

**Files:**
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/services/user.py`
- Create: `backend/app/api/v1/users.py`
- Modify: `backend/app/api/router.py`

- [ ] **Step 1: 创建用户 Schema `backend/app/schemas/user.py`**

```python
"""用户管理请求/响应模式"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """创建用户请求"""
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    is_active: bool = True


class UserUpdate(BaseModel):
    """更新用户请求"""
    nickname: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    roles: list[str] = []
    created_at: datetime
    updated_at: datetime


class AssignRolesRequest(BaseModel):
    """分配角色请求"""
    role_ids: list[int]
```

- [ ] **Step 2: 创建用户 Service `backend/app/services/user.py`**

```python
"""用户管理业务逻辑"""
from typing import Optional
from sqlmodel import Session, select, func, col
from app.models.user import SysUser, SysRole, SysUserRole
from app.core.security import hash_password
from app.core.exceptions import BadRequestException, NotFoundException


def get_user_list(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
) -> tuple[list[SysUser], int]:
    """获取用户列表（分页/搜索）"""
    statement = select(SysUser)

    if keyword:
        statement = statement.where(
            (col(SysUser.username).contains(keyword)) |
            (col(SysUser.nickname).contains(keyword))
        )

    # 总数
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # 分页
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    statement = statement.order_by(col(SysUser.created_at).desc())
    users = session.exec(statement).all()

    return users, total


def get_user_by_id(session: Session, user_id: int) -> SysUser:
    """根据 ID 获取用户"""
    user = session.get(SysUser, user_id)
    if not user:
        raise NotFoundException("用户不存在")
    return user


def create_user(session: Session, username: str, password: str, **kwargs) -> SysUser:
    """创建用户"""
    # 检查用户名唯一
    existing = session.exec(
        select(SysUser).where(SysUser.username == username)
    ).first()
    if existing:
        raise BadRequestException(f"用户名 '{username}' 已存在")

    user = SysUser(
        username=username,
        hashed_password=hash_password(password),
        **kwargs,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user_id: int, **kwargs) -> SysUser:
    """更新用户信息"""
    user = get_user_by_id(session, user_id)

    # 如果传了新密码，需要哈希
    if "password" in kwargs and kwargs["password"]:
        kwargs["hashed_password"] = hash_password(kwargs.pop("password"))
    else:
        kwargs.pop("password", None)

    for key, value in kwargs.items():
        if value is not None:
            setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user_id: int):
    """删除用户（软删除）"""
    user = get_user_by_id(session, user_id)
    user.is_active = False
    session.add(user)
    session.commit()


def assign_roles(session: Session, user_id: int, role_ids: list[int]):
    """为用户分配角色"""
    user = get_user_by_id(session, user_id)

    # 验证角色是否存在
    for role_id in role_ids:
        role = session.get(SysRole, role_id)
        if not role:
            raise BadRequestException(f"角色 ID {role_id} 不存在")

    # 清除旧关联
    existing_links = session.exec(
        select(SysUserRole).where(SysUserRole.user_id == user_id)
    ).all()
    for link in existing_links:
        session.delete(link)

    # 建立新关联
    for role_id in role_ids:
        link = SysUserRole(user_id=user_id, role_id=role_id)
        session.add(link)

    session.commit()
```

- [ ] **Step 3: 创建用户路由 `backend/app/api/v1/users.py`**

```python
"""用户管理路由"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.core.database import get_session
from app.core.deps import require_permission
from app.schemas.common import ApiResponse, PaginatedData
from app.schemas.user import UserCreate, UserUpdate, UserResponse, AssignRolesRequest
from app.services import user as user_service

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("/", response_model=ApiResponse[PaginatedData[UserResponse]],
            dependencies=[Depends(require_permission("user:read"))])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    """获取用户列表"""
    users, total = user_service.get_user_list(session, page, page_size, keyword)
    items = [
        UserResponse(
            id=u.id, username=u.username, nickname=u.nickname,
            email=u.email, avatar=u.avatar, is_active=u.is_active,
            roles=[r.code for r in u.roles],
            created_at=u.created_at, updated_at=u.updated_at,
        ) for u in users
    ]
    return ApiResponse(data=PaginatedData(
        items=items, total=total, page=page, page_size=page_size
    ))


@router.post("/", response_model=ApiResponse[UserResponse],
             dependencies=[Depends(require_permission("user:create"))])
async def create_user(body: UserCreate, session: Session = Depends(get_session)):
    """创建用户"""
    user = user_service.create_user(
        session,
        username=body.username,
        password=body.password,
        nickname=body.nickname,
        email=body.email,
        is_active=body.is_active,
    )
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[], created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.get("/{user_id}", response_model=ApiResponse[UserResponse],
            dependencies=[Depends(require_permission("user:read"))])
async def get_user(user_id: int, session: Session = Depends(get_session)):
    """获取用户详情"""
    user = user_service.get_user_by_id(session, user_id)
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[r.code for r in user.roles],
        created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.put("/{user_id}", response_model=ApiResponse[UserResponse],
            dependencies=[Depends(require_permission("user:update"))])
async def update_user(
    user_id: int, body: UserUpdate, session: Session = Depends(get_session)
):
    """更新用户"""
    user = user_service.update_user(
        session, user_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(data=UserResponse(
        id=user.id, username=user.username, nickname=user.nickname,
        email=user.email, avatar=user.avatar, is_active=user.is_active,
        roles=[r.code for r in user.roles],
        created_at=user.created_at, updated_at=user.updated_at,
    ))


@router.delete("/{user_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("user:delete"))])
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    """删除用户（软删除）"""
    user_service.delete_user(session, user_id)
    return ApiResponse(message="用户已禁用")


@router.put("/{user_id}/roles", response_model=ApiResponse,
            dependencies=[Depends(require_permission("user:update"))])
async def assign_roles(
    user_id: int, body: AssignRolesRequest, session: Session = Depends(get_session)
):
    """为用户分配角色"""
    user_service.assign_roles(session, user_id, body.role_ids)
    return ApiResponse(message="角色分配成功")
```

- [ ] **Step 4: 在 `router.py` 中注册用户路由**

```python
"""API 路由汇总"""
from fastapi import APIRouter
from app.api.v1 import auth, users

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
```

- [ ] **Step 5: 验证用户管理 API**

测试接口：
1. `POST /api/v1/users` — 创建用户（需 admin Token + user:create 权限）
2. `GET /api/v1/users` — 用户列表
3. `PUT /api/v1/users/{id}/roles` — 分配角色

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: 实现用户管理 CRUD API（列表/创建/更新/删除/角色分配）"
```

---

## Task 8: 角色权限管理 API

**Files:**
- Create: `backend/app/schemas/role.py`
- Create: `backend/app/services/role.py`
- Create: `backend/app/api/v1/roles.py`
- Modify: `backend/app/api/router.py`

- [ ] **Step 1: 创建角色 Schema `backend/app/schemas/role.py`**

```python
"""角色与权限请求/响应模式"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    """创建角色请求"""
    name: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleUpdate(BaseModel):
    """更新角色请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleResponse(BaseModel):
    """角色响应"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    permissions: list[str] = []
    created_at: datetime


class PermissionResponse(BaseModel):
    """权限响应"""
    id: int
    code: str
    name: str
    module: str


class AssignPermissionsRequest(BaseModel):
    """分配权限请求"""
    permission_ids: list[int]
```

- [ ] **Step 2: 创建角色 Service `backend/app/services/role.py`**

```python
"""角色管理业务逻辑"""
from sqlmodel import Session, select
from app.models.user import SysRole, SysPermission, SysRolePermission
from app.core.exceptions import BadRequestException, NotFoundException


def get_role_list(session: Session) -> list[SysRole]:
    """获取所有角色"""
    return session.exec(select(SysRole)).all()


def get_role_by_id(session: Session, role_id: int) -> SysRole:
    """根据 ID 获取角色"""
    role = session.get(SysRole, role_id)
    if not role:
        raise NotFoundException("角色不存在")
    return role


def create_role(session: Session, name: str, code: str, description: str = None) -> SysRole:
    """创建角色"""
    existing = session.exec(select(SysRole).where(SysRole.code == code)).first()
    if existing:
        raise BadRequestException(f"角色代码 '{code}' 已存在")

    role = SysRole(name=name, code=code, description=description)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def update_role(session: Session, role_id: int, **kwargs) -> SysRole:
    """更新角色"""
    role = get_role_by_id(session, role_id)
    for key, value in kwargs.items():
        if value is not None:
            setattr(role, key, value)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def delete_role(session: Session, role_id: int):
    """删除角色"""
    role = get_role_by_id(session, role_id)
    # 防止删除预置角色
    if role.code in ("super_admin", "content_admin", "customer_service"):
        raise BadRequestException("不允许删除预置角色")
    session.delete(role)
    session.commit()


def assign_permissions(session: Session, role_id: int, permission_ids: list[int]):
    """为角色分配权限"""
    role = get_role_by_id(session, role_id)

    # 验证权限
    for pid in permission_ids:
        perm = session.get(SysPermission, pid)
        if not perm:
            raise BadRequestException(f"权限 ID {pid} 不存在")

    # 清除旧关联
    existing = session.exec(
        select(SysRolePermission).where(SysRolePermission.role_id == role_id)
    ).all()
    for link in existing:
        session.delete(link)

    # 建立新关联
    for pid in permission_ids:
        link = SysRolePermission(role_id=role_id, permission_id=pid)
        session.add(link)

    session.commit()


def get_all_permissions(session: Session) -> list[SysPermission]:
    """获取所有权限"""
    return session.exec(select(SysPermission).order_by(SysPermission.module)).all()
```

- [ ] **Step 3: 创建角色路由 `backend/app/api/v1/roles.py`**

```python
"""角色权限管理路由"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_permission
from app.schemas.common import ApiResponse
from app.schemas.role import (
    RoleCreate, RoleUpdate, RoleResponse,
    PermissionResponse, AssignPermissionsRequest,
)
from app.services import role as role_service

router = APIRouter(prefix="/roles", tags=["角色权限"])


@router.get("/", response_model=ApiResponse[list[RoleResponse]],
            dependencies=[Depends(require_permission("role:read"))])
async def list_roles(session: Session = Depends(get_session)):
    """获取角色列表"""
    roles = role_service.get_role_list(session)
    items = [
        RoleResponse(
            id=r.id, name=r.name, code=r.code,
            description=r.description,
            permissions=[p.code for p in r.permissions],
            created_at=r.created_at,
        ) for r in roles
    ]
    return ApiResponse(data=items)


@router.post("/", response_model=ApiResponse[RoleResponse],
             dependencies=[Depends(require_permission("role:create"))])
async def create_role(body: RoleCreate, session: Session = Depends(get_session)):
    """创建角色"""
    role = role_service.create_role(session, body.name, body.code, body.description)
    return ApiResponse(data=RoleResponse(
        id=role.id, name=role.name, code=role.code,
        description=role.description, permissions=[],
        created_at=role.created_at,
    ))


@router.put("/{role_id}", response_model=ApiResponse[RoleResponse],
            dependencies=[Depends(require_permission("role:update"))])
async def update_role(
    role_id: int, body: RoleUpdate, session: Session = Depends(get_session)
):
    """更新角色"""
    role = role_service.update_role(
        session, role_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(data=RoleResponse(
        id=role.id, name=role.name, code=role.code,
        description=role.description,
        permissions=[p.code for p in role.permissions],
        created_at=role.created_at,
    ))


@router.delete("/{role_id}", response_model=ApiResponse,
               dependencies=[Depends(require_permission("role:delete"))])
async def delete_role(role_id: int, session: Session = Depends(get_session)):
    """删除角色"""
    role_service.delete_role(session, role_id)
    return ApiResponse(message="角色已删除")


@router.put("/{role_id}/permissions", response_model=ApiResponse,
            dependencies=[Depends(require_permission("role:update"))])
async def assign_permissions(
    role_id: int, body: AssignPermissionsRequest,
    session: Session = Depends(get_session),
):
    """为角色分配权限"""
    role_service.assign_permissions(session, role_id, body.permission_ids)
    return ApiResponse(message="权限分配成功")


@router.get("/permissions", response_model=ApiResponse[list[PermissionResponse]],
            dependencies=[Depends(require_permission("role:read"))])
async def list_permissions(session: Session = Depends(get_session)):
    """获取所有权限列表"""
    perms = role_service.get_all_permissions(session)
    items = [
        PermissionResponse(id=p.id, code=p.code, name=p.name, module=p.module)
        for p in perms
    ]
    return ApiResponse(data=items)
```

- [ ] **Step 4: 在 `router.py` 中注册角色路由**

```python
from app.api.v1 import auth, users, roles

api_router.include_router(roles.router)
```

- [ ] **Step 5: 验证角色权限 API**

测试接口：
1. `GET /api/v1/roles` — 角色列表
2. `GET /api/v1/roles/permissions` — 权限列表
3. `PUT /api/v1/roles/{id}/permissions` — 分配权限

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: 实现角色权限管理 API（角色CRUD/权限列表/权限分配）"
```

---

## Task 9: 文件存储抽象层

**Files:**
- Create: `backend/app/storage/__init__.py`
- Create: `backend/app/storage/base.py`
- Create: `backend/app/storage/local.py`
- Create: `backend/app/storage/minio_storage.py`
- Create: `backend/app/api/v1/upload.py`
- Modify: `backend/app/api/router.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: 创建存储接口 `backend/app/storage/base.py`**

```python
"""文件存储抽象接口"""
from abc import ABC, abstractmethod
from fastapi import UploadFile


class StorageBackend(ABC):
    """存储后端抽象基类"""

    @abstractmethod
    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件，返回访问 URL"""
        ...

    @abstractmethod
    async def delete(self, path: str) -> bool:
        """删除文件"""
        ...

    @abstractmethod
    async def get_url(self, path: str) -> str:
        """获取文件访问 URL"""
        ...
```

- [ ] **Step 2: 创建本地存储实现 `backend/app/storage/local.py`**

```python
"""本地文件系统存储实现"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile
from app.storage.base import StorageBackend
from app.core.config import settings


class LocalStorage(StorageBackend):
    """本地文件存储"""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _generate_path(self, file_type: str, filename: str) -> str:
        """生成存储路径: {type}/{yyyy}/{mm}/{uuid}.{ext}"""
        now = datetime.utcnow()
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        return f"{file_type}/{now.year}/{now.month:02d}/{unique_name}"

    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件到本地"""
        full_path = self.upload_dir / path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        content = await file.read()
        with open(full_path, "wb") as f:
            f.write(content)

        return f"/uploads/{path}"

    async def delete(self, path: str) -> bool:
        """删除本地文件"""
        # 去掉前缀 /uploads/
        relative = path.lstrip("/uploads/")
        full_path = self.upload_dir / relative
        if full_path.exists():
            os.remove(full_path)
            return True
        return False

    async def get_url(self, path: str) -> str:
        """获取本地文件 URL"""
        return path  # 本地存储直接返回相对路径
```

- [ ] **Step 3: 创建 MinIO 存储实现 `backend/app/storage/minio_storage.py`**

```python
"""MinIO 对象存储实现"""
import uuid
from datetime import datetime
from io import BytesIO
from fastapi import UploadFile
from app.storage.base import StorageBackend
from app.core.config import settings


class MinIOStorage(StorageBackend):
    """MinIO S3 兼容存储"""

    def __init__(self):
        from minio import Minio
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        # 确保 Bucket 存在
        for bucket in [settings.MINIO_BUCKET_IMAGES, settings.MINIO_BUCKET_VIDEOS]:
            if not self.client.bucket_exists(bucket):
                self.client.make_bucket(bucket)

    def _get_bucket(self, file_type: str) -> str:
        """根据文件类型获取 Bucket"""
        if file_type == "videos":
            return settings.MINIO_BUCKET_VIDEOS
        return settings.MINIO_BUCKET_IMAGES

    async def upload(self, file: UploadFile, path: str) -> str:
        """上传文件到 MinIO"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)

        content = await file.read()
        stream = BytesIO(content)

        self.client.put_object(
            bucket, path, stream, len(content),
            content_type=file.content_type,
        )

        return await self.get_url(path)

    async def delete(self, path: str) -> bool:
        """从 MinIO 删除文件"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)
        self.client.remove_object(bucket, path)
        return True

    async def get_url(self, path: str) -> str:
        """获取 MinIO 文件 URL"""
        file_type = path.split("/")[0]
        bucket = self._get_bucket(file_type)
        protocol = "https" if settings.MINIO_USE_SSL else "http"
        return f"{protocol}://{settings.MINIO_ENDPOINT}/{bucket}/{path}"
```

- [ ] **Step 4: 创建存储工厂 `backend/app/storage/__init__.py`**

```python
"""存储模块 — 根据配置返回对应的存储后端实例"""
from app.core.config import settings
from app.storage.base import StorageBackend


def get_storage() -> StorageBackend:
    """获取当前配置的存储后端"""
    if settings.STORAGE_BACKEND == "minio":
        from app.storage.minio_storage import MinIOStorage
        return MinIOStorage()
    else:
        from app.storage.local import LocalStorage
        return LocalStorage()
```

- [ ] **Step 5: 创建上传路由 `backend/app/api/v1/upload.py`**

```python
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
```

- [ ] **Step 6: 在 `main.py` 中挂载静态文件（本地存储时）**

在 `create_app()` 中添加：

```python
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# 在 create_app() 最后添加
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
if settings.STORAGE_BACKEND == "local":
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
```

- [ ] **Step 7: 在 `router.py` 中注册上传路由**

```python
from app.api.v1 import auth, users, roles, upload
api_router.include_router(upload.router)
```

- [ ] **Step 8: 提交**

```bash
git add .
git commit -m "feat: 实现文件存储抽象层（本地 + MinIO）与上传 API"
```

---

## Task 10: 前端项目脚手架

**Files:**
- Create: `frontend/` (通过 Vite CLI 初始化)
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/stores/auth.ts`
- Create: `frontend/src/types/api.ts`

- [ ] **Step 1: 使用 Vite 初始化 React + TypeScript 项目**

```bash
cd d:\codes\cybermind
npx -y create-vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: 安装前端依赖**

```bash
cd d:\codes\cybermind\frontend
npm install
npm install react-router@7 axios @tanstack/react-query zustand
npm install @tailwindcss/vite tailwindcss @tailwindcss/cli
npm install recharts @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install -D @types/node
```

- [ ] **Step 3: 配置 Tailwind CSS 4.x**

修改 `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

修改 `frontend/src/index.css`（Tailwind 4.x 语法）:

```css
@import "tailwindcss";
```

- [ ] **Step 4: 初始化 shadcn/ui**

```bash
cd d:\codes\cybermind\frontend
npx -y shadcn@latest init
```

根据提示选择：
- Style: New York
- Base color: Zinc
- CSS variables: Yes

- [ ] **Step 5: 安装 shadcn/ui 常用组件**

```bash
cd d:\codes\cybermind\frontend
npx -y shadcn@latest add button input label card table dialog dropdown-menu avatar badge separator sheet tabs toast form select
```

- [ ] **Step 6: 创建 TypeScript 类型定义 `frontend/src/types/api.ts`**

```typescript
/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}

/** 分页数据 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string | null
  avatar: string | null
  is_active: boolean
  roles: string[]
  permissions: string[]
}

/** Token 响应 */
export interface TokenResponse {
  access_token: string
  token_type: string
}
```

- [ ] **Step 7: 创建 Axios 实例 `frontend/src/lib/api.ts`**

```typescript
/** Axios 实例 — 统一请求拦截/响应拦截/Token 刷新 */
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 携带 Cookie（refresh_token）
})

// 请求拦截器：自动附加 Authorization 头
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 自动刷新 Token
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 正在刷新，排队等待
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await apiClient.post('/auth/refresh')
        const newToken = data.data.access_token
        useAuthStore.getState().setAccessToken(newToken)
        onTokenRefreshed(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        // 刷新失败，清除状态跳转登录
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
```

- [ ] **Step 8: 创建认证状态管理 `frontend/src/stores/auth.ts`**

```typescript
/** 认证状态管理 — Zustand */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types/api'

interface AuthState {
  accessToken: string | null
  user: UserInfo | null
  setAccessToken: (token: string) => void
  setUser: (user: UserInfo) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, user: null }),

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        // 超级管理员拥有所有权限
        if (user.roles.includes('super_admin')) return true
        return user.permissions.includes(permission)
      },
    }),
    {
      name: 'cybermind-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
)
```

- [ ] **Step 9: 创建前端环境变量 `frontend/.env`**

```bash
VITE_API_BASE_URL=/api/v1
VITE_APP_TITLE=CyberMind CMS
```

- [ ] **Step 10: 验证前端启动**

```bash
cd d:\codes\cybermind\frontend
npm run dev
```

预期：访问 `http://localhost:5173` 可看到 Vite 默认页面。

- [ ] **Step 11: 提交**

```bash
git add .
git commit -m "feat: 初始化前端项目（React + TypeScript + Tailwind 4.x + shadcn/ui）"
```

---

## Task 11: 前端基础布局与路由

**Files:**
- Create: `frontend/src/components/layout/AppLayout.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`
- Create: `frontend/src/components/layout/Header.tsx`
- Create: `frontend/src/pages/login/index.tsx`
- Create: `frontend/src/pages/dashboard/index.tsx`
- Create: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: 创建认证 Hook `frontend/src/hooks/useAuth.ts`**

```typescript
/** 认证相关 Hooks */
import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse, TokenResponse, UserInfo } from '@/types/api'

/** 登录 */
export function useLogin() {
  const { setAccessToken, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', data)
      return res.data
    },
    onSuccess: async (data) => {
      if (data.data) {
        setAccessToken(data.data.access_token)
        // 登录后立即获取用户信息
        const userRes = await apiClient.get<ApiResponse<UserInfo>>('/auth/me')
        if (userRes.data.data) {
          setUser(userRes.data.data)
        }
      }
    },
  })
}

/** 登出 */
export function useLogout() {
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout')
    },
    onSettled: () => {
      logout()
      window.location.href = '/login'
    },
  })
}

/** 获取当前用户信息 */
export function useCurrentUser() {
  const { accessToken, setUser } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserInfo>>('/auth/me')
      if (res.data.data) {
        setUser(res.data.data)
      }
      return res.data.data
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 分钟缓存
  })
}
```

- [ ] **Step 2: 创建登录页 `frontend/src/pages/login/index.tsx`**

```tsx
/** 登录页 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(
      { username, password },
      { onSuccess: () => navigate('/dashboard') },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <Card className="w-full max-w-md border-zinc-700 bg-zinc-900/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            CyberMind CMS
          </CardTitle>
          <p className="text-sm text-zinc-400">后台管理系统</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">
                登录账号
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入账号"
                required
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                minLength={8}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
            {loginMutation.isError && (
              <p className="text-sm text-red-400">
                登录失败，请检查账号和密码
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '登录中...' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: 创建侧边栏 `frontend/src/components/layout/Sidebar.tsx`**

```tsx
/** 侧边栏导航 — 根据权限动态渲染菜单项 */
import { Link, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard, Image, Newspaper, MessageSquare,
  HelpCircle, Video, Settings, Users, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

const menuItems: MenuItem[] = [
  { label: '仪表盘', path: '/dashboard', icon: LayoutDashboard, permission: 'stats:read' },
  { label: 'Banner 管理', path: '/banners', icon: Image, permission: 'banner:read' },
  { label: '新闻资讯', path: '/news', icon: Newspaper, permission: 'news:read' },
  { label: '联系我们', path: '/contacts', icon: MessageSquare, permission: 'contact:read' },
  { label: '帮助中心', path: '/help', icon: HelpCircle, permission: 'help:read' },
  { label: '操作视频', path: '/videos', icon: Video, permission: 'video:read' },
  { label: '站点配置', path: '/site-config', icon: Settings, permission: 'config:read' },
  { label: '用户管理', path: '/users', icon: Users, permission: 'user:read' },
  { label: '角色权限', path: '/roles', icon: Shield, permission: 'role:read' },
]

export default function Sidebar() {
  const location = useLocation()
  const { hasPermission, user } = useAuthStore()

  const visibleItems = menuItems.filter((item) => {
    if (!item.permission) return true
    // 超级管理员显示所有菜单
    if (user?.roles.includes('super_admin')) return true
    return hasPermission(item.permission)
  })

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-zinc-800">
        <h1 className="text-lg font-bold text-white">CyberMind</h1>
      </div>

      {/* 菜单 */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 4: 创建顶部栏 `frontend/src/components/layout/Header.tsx`**

```tsx
/** 顶部导航栏 — 面包屑 + 用户菜单 */
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/hooks/useAuth'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user } = useAuthStore()
  const logoutMutation = useLogout()

  const displayName = user?.nickname || user?.username || '用户'
  const initials = displayName.slice(0, 1).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div />

      {/* 用户菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-zinc-300 outline-none hover:text-white">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-zinc-700 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            个人信息
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logoutMutation.mutate()}
            className="text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

- [ ] **Step 5: 创建应用布局 `frontend/src/components/layout/AppLayout.tsx`**

```tsx
/** 应用主布局 — 侧边栏 + 顶栏 + 内容区 */
import { Outlet, Navigate } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const { accessToken } = useAuthStore()

  // 未登录跳转登录页
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 创建仪表盘占位页 `frontend/src/pages/dashboard/index.tsx`**

```tsx
/** 仪表盘页面 — 阶段二完善 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">仪表盘</h1>
      <p className="text-zinc-400">欢迎使用 CyberMind CMS 后台管理系统</p>
    </div>
  )
}
```

- [ ] **Step 7: 配置路由和 App 根组件 `frontend/src/App.tsx`**

```tsx
/** 应用根组件 — 路由配置 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* 阶段二业务模块路由在此添加 */}
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 8: 更新 `frontend/src/main.tsx` 入口**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: 安装 lucide-react 图标库**

```bash
cd d:\codes\cybermind\frontend
npm install lucide-react
```

- [ ] **Step 10: 验证前后端联调**

1. 启动后端: `cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
2. 启动前端: `cd frontend && npm run dev`
3. 访问 `http://localhost:5173/login`
4. 使用 `admin / admin123` 登录
5. 预期：登录成功后跳转到仪表盘，侧边栏显示所有菜单

- [ ] **Step 11: 提交**

```bash
git add .
git commit -m "feat: 实现前端基础布局（登录页/侧边栏/路由守卫/权限菜单）"
```

---

## 阶段一完成验证

- [ ] **所有 API 可用性验证**
  - `POST /api/v1/auth/login` — 登录
  - `GET /api/v1/auth/me` — 获取当前用户
  - `POST /api/v1/auth/refresh` — 刷新 Token
  - `GET /api/v1/users` — 用户列表
  - `POST /api/v1/users` — 创建用户
  - `GET /api/v1/roles` — 角色列表
  - `GET /api/v1/roles/permissions` — 权限列表
  - `POST /api/v1/upload/image` — 图片上传

- [ ] **前端验证**
  - 登录页正常展示并可登录
  - 登录后跳转仪表盘
  - 侧边栏菜单根据权限动态显示
  - 未登录访问受保护页面自动跳转登录页
  - Token 过期自动刷新

---

> **后续阶段：** 阶段二（核心业务模块）和阶段三（数据统计与优化）将在阶段一完成后分别编写独立的实施计划。
