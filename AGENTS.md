# AGENTS.md — CyberMind 项目规范约束

> 本文档是 CyberMind CMS 后台管理系统的**权威规范约束文件**，对所有参与开发的人员与 AI 代理具有最高约束力。任何代码变更必须符合本文档定义的标准。

---

## 1. 项目概览

- **项目名称：** CyberMind CMS 后台管理系统
- **项目定位：** 纯后台运营管理系统（CMS），管理企业官网内容
- **架构模式：** 前后端分离 Monorepo + Docker Compose 编排
- **设计规格：** 详见 [`docs/superpowers/specs/2026-06-06-cybermind-cms-design.md`](docs/superpowers/specs/2026-06-06-cybermind-cms-design.md)

---

## 2. 技术栈锁定

以下技术选型已确定，**禁止未经审批擅自替换**：

### 后端

| 项目 | 技术 | 版本要求 |
|------|------|----------|
| 语言 | Python | 3.12+ |
| 框架 | FastAPI | 最新稳定版 |
| 包管理 | **uv** | 最新稳定版 |
| ORM | SQLModel | 最新稳定版 |
| 数据库 | MySQL | 8.0+ |
| 数据库迁移 | Alembic | 最新稳定版 |
| 密码加密 | passlib[bcrypt] | — |
| JWT | python-jose[cryptography] | — |
| 文件存储 | 本地 + MinIO (S3兼容) | — |

### 前端

| 项目 | 技术 | 版本要求 |
|------|------|----------|
| 框架 | React | 19+ |
| 类型系统 | TypeScript | 严格模式 |
| 构建工具 | Vite | 最新稳定版 |
| CSS 框架 | Tailwind CSS | **4.x** |
| UI 组件库 | shadcn/ui | 最新版 |
| 状态管理 | Zustand | — |
| 请求层 | Axios + TanStack Query (React Query) | — |
| 富文本编辑器 | TipTap (ProseMirror) | — |
| 图表 | Recharts | — |
| 路由 | React Router | v7 |
| 包管理 | pnpm | 最新稳定版 |

### 基础设施

| 项目 | 技术 |
|------|------|
| 容器编排 | Docker Compose |
| 反向代理 | Nginx（生产环境） |
| 对象存储 | MinIO（可选） |

---

## 3. 项目结构规范

```
cybermind/
├── AGENTS.md                   # 本文件 — 项目规范约束（最高优先级）
├── backend/                    # 后端服务
│   ├── pyproject.toml          # uv 项目配置（唯一依赖定义处）
│   ├── alembic/                # 数据库迁移文件
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py             # FastAPI 入口（禁止放业务逻辑）
│   │   ├── core/               # 核心配置（config/security/deps）
│   │   ├── models/             # SQLModel 数据模型（每个业务一个文件）
│   │   ├── schemas/            # Pydantic 请求/响应模式
│   │   ├── api/v1/             # API 路由（按模块分文件）
│   │   ├── services/           # 业务逻辑层
│   │   ├── storage/            # 文件存储抽象层
│   │   └── middleware/         # 中间件
│   ├── tests/                  # 测试（与 app/ 目录结构镜像）
│   ├── uploads/                # 本地文件上传目录（已 gitignore）
│   └── Dockerfile
├── frontend/                   # 前端应用
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── components/ui/      # shadcn/ui 组件（通过 CLI 安装，禁止手动修改）
│   │   ├── components/layout/  # 布局组件
│   │   ├── components/         # 业务通用组件
│   │   ├── pages/              # 页面组件（按模块分目录）
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── lib/                # 工具函数 + Axios 实例
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── types/              # TypeScript 类型定义
│   │   └── styles/             # 全局样式
│   └── Dockerfile
├── docker-compose.yml          # 生产环境编排
├── docker-compose.dev.yml      # 开发环境覆盖
├── .env.example                # 环境变量模板
├── docs/                       # 设计文档、规格说明
└── README.md
```

### 结构约束

- **禁止**在根目录下放置业务代码文件
- **禁止**在 `backend/app/main.py` 中编写业务逻辑，入口文件仅负责应用初始化
- **禁止**跨层调用：路由层（api）不得直接操作数据库，必须通过 Service 层
- 每个模块的 model / schema / api / service 文件**必须一一对应**
- 前端 `components/ui/` 目录下的 shadcn/ui 组件**禁止手动修改**，仅通过 CLI 安装更新
- 前端页面组件按模块放在 `pages/{module}/` 目录下，每个模块一个文件夹

---

## 4. 命名规范

### 4.1 通用规则

- **代码标识符**（变量名、函数名、类名等）：**必须使用英文**，严禁使用拼音或中文
- **代码注释**：使用中文
- **Git Commit Message**：使用中文
- **文档**：使用中文

### 4.2 后端命名

| 元素 | 风格 | 示例 |
|------|------|------|
| 文件名 | snake_case | `site_config.py` |
| 类名 | PascalCase | `NewsArticle`, `HelpCategory` |
| 函数/方法 | snake_case | `get_article_by_id()` |
| 变量 | snake_case | `page_size`, `current_user` |
| 常量 | UPPER_SNAKE_CASE | `ACCESS_TOKEN_EXPIRE_MINUTES` |
| API 路径 | kebab-case | `/api/v1/site-config` |
| 查询参数 | snake_case | `?page_size=10&sort_by=created_at` |

### 4.3 前端命名

| 元素 | 风格 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `BannerList.tsx`, `LoginPage.tsx` |
| 工具/Hook 文件 | camelCase.ts | `useAuth.ts`, `apiClient.ts` |
| 组件名 | PascalCase | `<BannerList />` |
| 函数/变量 | camelCase | `fetchArticles`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS 类名 | Tailwind 工具类（禁止自定义 BEM） | — |
| TypeScript 类型/接口 | PascalCase | `NewsArticle`, `ApiResponse<T>` |
| 接口命名 | 以 `I` 前缀或语义化 | `LoginRequest`, `PaginatedResponse` |

### 4.4 数据库命名

| 元素 | 风格 | 示例 |
|------|------|------|
| **基础设施表** | `sys_` 前缀 + snake_case | `sys_users`, `sys_roles`, `sys_permissions` |
| **业务表** | 无前缀 + snake_case | `banners`, `news_articles`, `contact_submissions` |
| 关联表 | `sys_` 前缀（属于基础设施） | `sys_user_roles`, `sys_role_permissions` |
| 字段名 | snake_case | `created_at`, `is_active`, `view_count` |
| 主键 | `id`（int, auto increment） | — |
| 外键 | `{关联实体}_id` | `category_id`, `user_id` |
| 布尔字段 | `is_` 前缀 | `is_active`, `is_top` |
| 时间字段 | `_at` 后缀 | `created_at`, `updated_at`, `published_at` |

> **关键规则：** 基础设施表（用户、角色、权限及其关联表）统一加 `sys_` 前缀，业务表不加前缀。

---

## 5. 后端开发规范

### 5.1 分层架构（强制）

```
请求 → API 路由层 (api/v1/) → Service 业务层 (services/) → Model 数据层 (models/)
                                                           → Storage 存储层 (storage/)
```

| 层 | 职责 | 禁止 |
|----|------|------|
| **API 路由层** | 参数校验、权限声明、调用 Service、返回响应 | 禁止写业务逻辑、禁止直接操作 DB |
| **Service 层** | 业务逻辑、事务管理、跨模型操作 | 禁止处理 HTTP 请求/响应 |
| **Model 层** | SQLModel 模型定义、数据库表映射 | 禁止写业务逻辑 |
| **Schema 层** | Pydantic 请求/响应模型、数据验证 | 禁止依赖 SQLModel |
| **Storage 层** | 文件上传/删除/URL获取 | 禁止业务逻辑 |

### 5.2 依赖注入

- 所有公共依赖（数据库会话、当前用户、权限校验）通过 FastAPI 的 `Depends()` 注入
- 权限校验依赖统一定义在 `core/deps.py`
- 示例权限声明：

```python
@router.get("/", dependencies=[Depends(require_permission("banner:read"))])
async def list_banners(...):
    ...
```

### 5.3 API 响应格式（统一）

所有 API 响应必须遵循以下格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

分页响应：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

错误响应：

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null
}
```

### 5.4 错误处理

- 使用自定义异常类，统一通过 FastAPI 异常处理器捕获
- 业务异常继承自 `AppException` 基类
- HTTP 状态码规范：
  - `200` — 成功
  - `201` — 创建成功
  - `400` — 请求参数错误
  - `401` — 未认证
  - `403` — 无权限
  - `404` — 资源不存在
  - `422` — 数据验证失败
  - `500` — 服务器内部错误

### 5.5 数据库操作

- **必须**使用 Alembic 管理数据库迁移，禁止手动修改数据库结构
- 每次模型变更后**必须**生成迁移文件并审查
- 软删除优于硬删除（用户表通过 `is_active` 标记）
- 批量操作必须使用事务
- 查询必须添加合理的索引

### 5.6 包管理

- **必须**使用 `uv` 管理 Python 依赖，禁止使用 pip 直接安装
- 常用命令：
  - `uv add <package>` — 添加依赖
  - `uv remove <package>` — 移除依赖
  - `uv sync` — 同步依赖
  - `uv run <command>` — 在虚拟环境中运行命令
- 禁止手动编辑 `uv.lock` 文件

---

## 6. 前端开发规范

### 6.1 TypeScript 严格模式

- `tsconfig.json` 中必须启用 `"strict": true`
- 禁止使用 `any` 类型（极端情况使用 `unknown` + 类型断言）
- 所有 API 请求/响应必须有对应的类型定义
- 组件 Props 必须定义接口类型

### 6.2 组件规范

- 函数组件 + Hooks，禁止使用类组件
- 组件文件命名使用 PascalCase：`BannerList.tsx`
- 每个组件文件只导出一个主组件
- 复杂组件拆分为子组件，放在同一目录下
- 页面组件结构示例：

```
pages/banners/
├── index.tsx          # 列表页（默认导出）
├── BannerForm.tsx     # 表单组件（新建/编辑共用）
└── BannerCard.tsx     # 列表卡片组件
```

### 6.3 状态管理

- **全局状态**用 Zustand（认证信息、应用配置、菜单折叠等）
- **服务端状态**用 TanStack Query（API 数据缓存、加载状态、乐观更新）
- **组件局部状态**用 `useState` / `useReducer`
- 禁止将可以通过 TanStack Query 管理的服务端数据放入 Zustand

### 6.4 API 请求

- 所有请求通过 `lib/api.ts` 中的 Axios 实例发起
- Axios 实例必须配置：
  - 请求拦截器：自动附加 `Authorization: Bearer <token>` 头
  - 响应拦截器：401 状态自动触发 Token 刷新，刷新失败跳转登录页
  - 基础 URL 通过环境变量配置
- API 调用封装为 TanStack Query 的 `useQuery` / `useMutation` 自定义 Hook

### 6.5 样式规范

- 优先使用 Tailwind CSS 工具类
- 禁止使用内联 `style` 属性（除动态计算值外）
- shadcn/ui 组件不可修改源码，如需定制通过 `className` 覆盖
- 主题色、圆角、间距等设计令牌通过 Tailwind 配置统一管理
- 支持暗色/亮色模式切换，所有自定义样式必须兼容两种模式

### 6.6 路由与权限

- 路由配置集中管理，统一定义在路由配置文件中
- 路由守卫：未登录跳转登录页，已登录跳转仪表盘
- 菜单项根据当前用户权限动态渲染
- 路由级别的权限校验在路由守卫中完成
- 页面内按钮级别的权限校验通过封装的 `usePermission` Hook 实现

---

## 7. 认证与安全规范

### 7.1 JWT 双 Token 策略

| Token | 有效期 | 存储位置 | 传递方式 |
|-------|--------|----------|----------|
| access_token | 30 分钟 | 前端内存 / localStorage | `Authorization: Bearer <token>` |
| refresh_token | 7 天 | HTTP-Only Cookie | Cookie 自动携带 |

### 7.2 认证流程

1. 登录：`POST /api/v1/auth/login`，body 传 `username` + `password`
2. 返回 `access_token`（响应体）+ 设置 `refresh_token`（Cookie）
3. 请求附带 `Authorization: Bearer <access_token>`
4. access_token 过期 → 前端自动调用 `POST /api/v1/auth/refresh`
5. refresh_token 过期 → 前端清除状态，跳转登录页
6. 登出 → `POST /api/v1/auth/logout`，refresh_token 加入黑名单

### 7.3 密码安全

- 密码存储使用 `bcrypt` 哈希，**禁止**明文存储
- 密码最少 8 位
- 禁止在日志中输出任何敏感信息（密码、Token、密钥）

### 7.4 RBAC 权限模型

```
用户 (sys_users)
  ↓ 多对多
角色 (sys_roles)
  ↓ 多对多
权限 (sys_permissions)
```

- 权限代码格式：`{module}:{action}`
- 支持的 action：`create`, `read`, `update`, `delete`
- 权限校验通过 FastAPI `Depends()` 在路由级别声明

**预置权限清单：**

```
user:create, user:read, user:update, user:delete
role:create, role:read, role:update, role:delete
banner:create, banner:read, banner:update, banner:delete
news:create, news:read, news:update, news:delete
contact:read, contact:update, contact:delete
help:create, help:read, help:update, help:delete
video:create, video:read, video:update, video:delete
config:read, config:update
stats:read
```

**预置角色：**

| 角色 | 代码 | 权限范围 |
|------|------|----------|
| 超级管理员 | `super_admin` | 所有权限 |
| 内容管理员 | `content_admin` | banner/news/help/video 的完整 CRUD |
| 客服 | `customer_service` | contact:read, contact:update |

---

## 8. 数据库设计规范

### 8.1 表命名

- **基础设施表**加 `sys_` 前缀：`sys_users`, `sys_roles`, `sys_permissions`, `sys_user_roles`, `sys_role_permissions`
- **业务表**无前缀：`banners`, `news_articles`, `contact_submissions`, `help_categories`, `help_questions`, `operation_videos`, `site_configs`, `tracking_events`, `daily_stats`

### 8.2 通用字段

每张表**必须**包含以下时间字段：

```
created_at  DATETIME  NOT NULL  DEFAULT CURRENT_TIMESTAMP  -- 创建时间
updated_at  DATETIME  NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- 更新时间
```

### 8.3 主键规范

- 所有表使用 `id` 作为主键，类型 `INT AUTO_INCREMENT`
- 高容量表（如 `tracking_events`）使用 `BIGINT AUTO_INCREMENT`

### 8.4 外键规范

- 外键命名格式：`{关联实体名}_id`
- 基础设施表的外键指向 `sys_` 前缀表：如 `FK → sys_users.id`
- 业务表之间的外键指向无前缀表：如 `FK → help_categories.id`

### 8.5 索引规范

- 所有外键字段必须建索引
- 高频查询字段建索引（如 `status`, `is_active`, `created_at`）
- 联合唯一索引用于防重（如 `tracking_events` 的 `idx_dedup`）

### 8.6 字符集

- 数据库字符集：`utf8mb4`
- 排序规则：`utf8mb4_unicode_ci`

---

## 9. API 设计规范

### 9.1 URL 约定

- 基础路径：`/api/v1/`
- 资源使用名词复数：`/banners`, `/news`, `/videos`
- URL 使用 kebab-case：`/site-config`, `/help/questions`
- 嵌套资源最多两级：`/help/categories/{id}`, `/help/questions/{id}`

### 9.2 HTTP 方法

| 操作 | 方法 | 示例 |
|------|------|------|
| 列表/查询 | GET | `GET /api/v1/banners` |
| 详情 | GET | `GET /api/v1/banners/{id}` |
| 创建 | POST | `POST /api/v1/banners` |
| 全量更新 | PUT | `PUT /api/v1/banners/{id}` |
| 删除 | DELETE | `DELETE /api/v1/banners/{id}` |

### 9.3 分页参数

所有列表接口必须支持分页：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `page_size` | int | 20 | 每页条数（最大 100） |
| `sort_by` | string | `created_at` | 排序字段 |
| `sort_order` | string | `desc` | 排序方向（asc/desc） |

### 9.4 埋点接口（公开）

`POST /api/v1/tracking/event` 为**公开接口**（无需登录），用于收集前台页面访问数据。

**防重放策略：**
- 服务端自动提取客户端 IP（`X-Forwarded-For` > `request.client.host`）
- 生成 `fingerprint = sha256(ip + page_path + 5分钟时间窗口key)`
- 同一 fingerprint 仅入库一次，重复请求静默返回 `{"ok": true}`
- **禁止**在响应中暴露是否被去重

---

## 10. 文件存储规范

### 10.1 存储抽象

所有文件操作必须通过 `StorageBackend` 抽象接口，禁止在业务代码中直接操作文件系统或 MinIO SDK。

```python
class StorageBackend(ABC):
    async def upload(self, file: UploadFile, path: str) -> str: ...
    async def delete(self, path: str) -> bool: ...
    async def get_url(self, path: str) -> str: ...
```

### 10.2 存储路径

```
/uploads/{type}/{yyyy}/{mm}/{uuid}.{ext}
```

- `type`：`images`, `videos`, `files`
- `uuid`：使用 UUID4 避免文件名冲突
- 禁止使用用户上传的原始文件名作为存储路径

### 10.3 上传限制

| 类型 | 最大大小 | 允许的格式 |
|------|----------|------------|
| 图片 | 10 MB | jpg, jpeg, png, gif, webp, svg |
| 视频 | 500 MB | mp4, webm, mov, avi |
| 文件 | 50 MB | pdf, doc, docx, xls, xlsx |

---

## 11. Git 工作流规范

### 11.1 分支策略

| 分支 | 用途 | 保护 |
|------|------|------|
| `main` | 生产分支 | 受保护，仅通过 PR 合入 |
| `develop` | 开发主分支 | 日常开发基准 |
| `feature/{name}` | 功能分支 | 从 develop 拉取，完成后合回 develop |
| `fix/{name}` | 修复分支 | 从 develop 拉取 |
| `release/{version}` | 发布分支 | 从 develop 拉取，合入 main |

### 11.2 Commit 规范

使用中文 Commit Message，格式如下：

```
<类型>: <简短描述>

<详细说明（可选）>
```

**类型枚举：**

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 代码重构（不新增功能、不修复 Bug） |
| `test` | 测试相关 |
| `chore` | 构建/工具链变更 |
| `perf` | 性能优化 |

**示例：**
```
feat: 新增 Banner 管理模块的增删改查接口
fix: 修复 Token 刷新时并发请求导致的重复刷新问题
docs: 更新 API 接口文档
```

### 11.3 gitignore 规则

以下目录/文件必须在 `.gitignore` 中：

```
# 后端
backend/.venv/
backend/uploads/
backend/__pycache__/
*.pyc

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
```

---

## 12. 环境变量规范

所有环境变量在 `.env.example` 中定义模板，开发时复制为 `.env` 使用。

### 必需变量

```bash
# 数据库
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=cybermind
MYSQL_PASSWORD=
MYSQL_DATABASE=cybermind

# JWT
JWT_SECRET_KEY=                        # 随机生成的密钥，至少 32 位
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# 应用
APP_ENV=development                    # development / production
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:5173     # 允许的前端域名，逗号分隔

# 文件存储
STORAGE_BACKEND=local                  # local / minio
UPLOAD_DIR=./uploads

# MinIO（STORAGE_BACKEND=minio 时必填）
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_IMAGES=cybermind-images
MINIO_BUCKET_VIDEOS=cybermind-videos
MINIO_USE_SSL=false
```

### 前端环境变量

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE=CyberMind CMS
```

> **安全规则：** `.env` 文件禁止提交到 Git，JWT_SECRET_KEY 在生产环境中必须使用强随机值。

---

## 13. Docker 规范

### 13.1 开发环境

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

- 后端挂载代码目录，Uvicorn `--reload` 热重载
- 前端使用 `npm run dev`（Vite dev server，端口 5173）
- MySQL 数据持久化到 Docker Volume

### 13.2 生产环境

```bash
docker compose up -d
```

- 前端构建为静态文件，通过 Nginx 托管
- 后端通过 Uvicorn + Gunicorn 运行
- Nginx 反向代理统一入口

### 13.3 服务端口分配

| 服务 | 开发端口 | 生产端口 |
|------|----------|----------|
| 前端 | 5173 | 80 (Nginx) |
| 后端 | 8000 | 8000 (内部) |
| MySQL | 3306 | 3306 (内部) |
| MinIO | 9000/9001 | 9000 (内部) |

---

## 14. 测试规范

### 14.1 后端测试

- 测试框架：`pytest` + `pytest-asyncio`
- 测试文件放在 `backend/tests/` 下，目录结构镜像 `app/`
- 命名：`test_{module}.py`，测试函数 `test_{功能描述}()`
- API 测试使用 FastAPI 的 `TestClient`
- 必须覆盖：认证流程、权限校验、核心 CRUD

### 14.2 前端测试（可选阶段）

- 测试框架：Vitest
- 组件测试：React Testing Library
- 优先覆盖核心 Hooks 和工具函数

---

## 15. 代码审查检查清单

在提交代码前，必须确认以下事项：

- [ ] 代码标识符使用英文命名
- [ ] 注释使用中文
- [ ] 无 `any` 类型使用（前端）
- [ ] API 响应格式符合统一标准
- [ ] 数据库表名前缀正确（`sys_` 或无前缀）
- [ ] 敏感信息未出现在代码或日志中
- [ ] 新增 API 路由声明了权限依赖
- [ ] 数据库变更有对应的 Alembic 迁移文件
- [ ] 文件上传通过 StorageBackend 抽象层
- [ ] TypeScript 类型定义完整
- [ ] Commit Message 符合规范
