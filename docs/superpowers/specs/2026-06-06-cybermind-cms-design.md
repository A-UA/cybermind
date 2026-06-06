# CyberMind CMS 后台管理系统设计规格

## 1. 项目概述

### 1.1 项目定位
CyberMind 是一套纯后台管理系统（运营 CMS 后台），用于管理企业官网的各类内容，包括 Banner 管理、新闻资讯、联系表单、帮助中心、操作视频等模块。系统采用前后端分离架构，Monorepo + Docker Compose 编排。

### 1.2 技术栈

| 层面 | 技术选择 |
|------|----------|
| 后端框架 | FastAPI（Python 3.12+） |
| 包管理 | uv |
| ORM | SQLModel（Pydantic + SQLAlchemy） |
| 数据库 | MySQL 8.0 |
| 数据库迁移 | Alembic |
| 认证方案 | JWT + Refresh Token 双Token |
| 权限模型 | RBAC（用户-角色-权限） |
| 文件存储 | 本地文件系统 + MinIO（S3兼容，可切换） |
| 前端框架 | React 19 + TypeScript |
| 前端构建 | Vite |
| CSS 框架 | Tailwind CSS 4.x |
| UI 组件库 | shadcn/ui |
| 状态管理 | Zustand |
| 请求层 | Axios + React Query (TanStack Query) |
| 富文本编辑器 | TipTap（基于 ProseMirror） |
| 图表库 | Recharts |
| 路由 | React Router v7 |
| 容器编排 | Docker Compose |

---

## 2. 系统架构

### 2.1 整体架构

```
cybermind/
├── backend/                    # FastAPI 后端服务
│   ├── pyproject.toml          # uv 项目配置
│   ├── alembic/                # 数据库迁移
│   ├── app/
│   │   ├── main.py             # FastAPI 入口
│   │   ├── core/               # 核心配置
│   │   │   ├── config.py       # 应用配置（环境变量）
│   │   │   ├── security.py     # JWT/密码加密
│   │   │   └── deps.py         # 依赖注入
│   │   ├── models/             # SQLModel 数据模型
│   │   │   ├── user.py         # 用户/角色/权限模型
│   │   │   ├── banner.py       # Banner模型
│   │   │   ├── news.py         # 新闻资讯模型
│   │   │   ├── contact.py      # 联系我们表单模型
│   │   │   ├── help.py         # 帮助中心模型
│   │   │   ├── video.py        # 操作视频模型
│   │   │   ├── site_config.py  # 站点配置模型（二维码/手机号/邮箱）
│   │   │   └── stats.py        # 统计数据模型
│   │   ├── schemas/            # Pydantic 请求/响应模式
│   │   ├── api/                # API 路由
│   │   │   ├── v1/
│   │   │   │   ├── auth.py     # 登录/刷新Token
│   │   │   │   ├── users.py    # 用户管理
│   │   │   │   ├── roles.py    # 角色管理
│   │   │   │   ├── banners.py  # Banner管理
│   │   │   │   ├── news.py     # 新闻资讯
│   │   │   │   ├── contacts.py # 联系我们
│   │   │   │   ├── help.py     # 帮助中心
│   │   │   │   ├── videos.py   # 操作视频
│   │   │   │   ├── site_config.py # 站点配置
│   │   │   │   ├── stats.py    # 统计数据
│   │   │   │   └── upload.py   # 文件上传
│   │   │   └── router.py       # 路由汇总
│   │   ├── services/           # 业务逻辑层
│   │   ├── storage/            # 文件存储抽象层
│   │   │   ├── base.py         # 存储接口定义
│   │   │   ├── local.py        # 本地存储实现
│   │   │   └── minio.py        # MinIO 存储实现
│   │   └── middleware/         # 中间件
│   │       ├── access_log.py   # 访问日志/统计中间件
│   │       └── cors.py         # CORS 配置
│   ├── tests/                  # 测试
│   └── Dockerfile
├── frontend/                   # React 前端
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx            # 入口
│   │   ├── App.tsx             # 根组件
│   │   ├── components/         # 通用组件
│   │   │   ├── ui/             # shadcn/ui 组件
│   │   │   ├── layout/         # 布局组件（侧边栏、头部、面包屑）
│   │   │   ├── rich-editor/    # 富文本编辑器封装
│   │   │   └── upload/         # 上传组件封装
│   │   ├── pages/              # 页面组件
│   │   │   ├── login/          # 登录页
│   │   │   ├── dashboard/      # 仪表盘（首页）
│   │   │   ├── banners/        # Banner管理
│   │   │   ├── news/           # 新闻资讯管理
│   │   │   ├── contacts/       # 联系我们（表单查看）
│   │   │   ├── help/           # 帮助中心管理
│   │   │   ├── videos/         # 操作视频管理
│   │   │   ├── site-config/    # 站点配置（二维码/联系方式）
│   │   │   ├── users/          # 用户管理
│   │   │   └── roles/          # 角色权限管理
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── lib/                # 工具函数
│   │   │   ├── api.ts          # Axios 实例配置
│   │   │   ├── auth.ts         # 认证工具
│   │   │   └── utils.ts        # 通用工具
│   │   ├── stores/             # Zustand 状态管理
│   │   │   ├── auth.ts         # 认证状态
│   │   │   └── app.ts          # 应用全局状态
│   │   ├── types/              # TypeScript 类型定义
│   │   └── styles/             # 全局样式
│   └── Dockerfile
├── docker-compose.yml          # Docker 编排
├── .env.example                # 环境变量模板
└── README.md
```

### 2.2 请求流程

```
浏览器 → Nginx (生产) / Vite Dev Server (开发)
  → React SPA
    → Axios (带 JWT Token)
      → FastAPI → 中间件(CORS/访问统计)
        → 路由 → 依赖注入(鉴权/权限校验)
          → Service 层 → SQLModel/MySQL
          → 文件存储(本地/MinIO)
```

---

## 3. 数据库设计

### 3.1 用户与权限（RBAC）

> 基础设施表统一使用 `sys_` 前缀，业务表无前缀。

**sys_users 表（用户）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| username | varchar(50), unique | **登录账号**（用户通过此字段 + 密码进行登录认证） |
| nickname | varchar(50), nullable | 显示昵称 |
| email | varchar(100), unique, nullable | 邮箱 |
| hashed_password | varchar(255) | 密码哈希 |
| is_active | boolean, default true | 是否启用 |
| avatar | varchar(500), nullable | 头像URL |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

**sys_roles 表（角色）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| name | varchar(50), unique | 角色名称 |
| description | varchar(255), nullable | 角色描述 |
| created_at | datetime | 创建时间 |

**sys_permissions 表（权限）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| code | varchar(100), unique | 权限代码（如 `banner:create`） |
| name | varchar(100) | 权限名称 |
| module | varchar(50) | 所属模块 |

**sys_user_roles 关联表**
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | int, FK → sys_users.id | 用户ID |
| role_id | int, FK → sys_roles.id | 角色ID |

**sys_role_permissions 关联表**
| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | int, FK → sys_roles.id | 角色ID |
| permission_id | int, FK → sys_permissions.id | 权限ID |

### 3.2 Banner 管理

**banners 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| title | varchar(200) | 标题 |
| image_url | varchar(500) | 图片URL |
| link_url | varchar(500), nullable | 跳转链接 |
| sort_order | int, default 0 | 排序序号 |
| is_active | boolean, default true | 是否启用 |
| created_by | int, FK → sys_users.id | 创建人 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.3 新闻资讯

**news_articles 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| title | varchar(200) | 文章标题 |
| summary | varchar(500), nullable | 文章摘要 |
| content | longtext | 富文本内容 |
| cover_image | varchar(500), nullable | 封面图 |
| category | varchar(50), nullable | 分类 |
| tags | varchar(500), nullable | 标签（JSON数组） |
| status | enum('draft','published','archived') | 状态 |
| view_count | int, default 0 | 浏览量 |
| is_top | boolean, default false | 是否置顶 |
| published_at | datetime, nullable | 发布时间 |
| created_by | int, FK → sys_users.id | 作者 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.4 联系我们

**contact_submissions 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| name | varchar(100) | 姓名 |
| phone | varchar(20), nullable | 手机号 |
| email | varchar(100), nullable | 邮箱 |
| company | varchar(200), nullable | 公司名 |
| subject | varchar(200) | 主题 |
| message | text | 留言内容 |
| status | enum('unread','read','replied') | 处理状态 |
| reply_content | text, nullable | 回复内容 |
| replied_at | datetime, nullable | 回复时间 |
| created_at | datetime | 提交时间 |

### 3.5 帮助中心

**help_categories 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| name | varchar(100) | 分类名称 |
| sort_order | int, default 0 | 排序 |
| created_at | datetime | 创建时间 |

**help_questions 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| category_id | int, FK → help_categories.id | 分类ID |
| question | varchar(500) | 问题 |
| answer | text | 回答（支持富文本） |
| sort_order | int, default 0 | 排序 |
| is_active | boolean, default true | 是否启用 |
| created_by | int, FK → sys_users.id | 创建人 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.6 操作视频

**operation_videos 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| title | varchar(200) | 视频标题 |
| description | text, nullable | 视频描述 |
| video_url | varchar(500) | 视频URL |
| cover_image | varchar(500), nullable | 封面图 |
| duration | int, nullable | 时长（秒） |
| category | varchar(50), nullable | 分类 |
| sort_order | int, default 0 | 排序 |
| is_active | boolean, default true | 是否启用 |
| view_count | int, default 0 | 观看次数 |
| created_by | int, FK → sys_users.id | 上传人 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.7 站点配置

**site_configs 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| config_key | varchar(100), unique | 配置键 |
| config_value | text | 配置值 |
| config_type | enum('text','image','json') | 值类型 |
| description | varchar(255), nullable | 描述 |
| updated_at | datetime | 更新时间 |
| updated_by | int, FK → sys_users.id | 更新人 |

预置配置项：
- `qr_code_image` — 二维码图片URL
- `contact_phone` — 手机号
- `contact_email` — 邮箱
- `site_name` — 站点名称
- `site_logo` — 站点LOGO

### 3.8 访问统计（埋点）

**tracking_events 表（埋点记录）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint, PK, auto | 主键 |
| page_path | varchar(500) | 访问页面路径 |
| ip_address | varchar(45) | 访问IP |
| user_agent | varchar(500), nullable | 浏览器UA |
| referer | varchar(500), nullable | 来源页 |
| fingerprint | varchar(64), nullable | 请求指纹（用于防重放） |
| created_at | datetime | 访问时间 |

> **唯一约束：** `UNIQUE INDEX idx_dedup (page_path, ip_address, fingerprint)` 配合时间窗口实现同IP去重。

**daily_stats 表（每日汇总）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int, PK, auto | 主键 |
| stat_date | date, unique | 统计日期 |
| total_views | int, default 0 | 总浏览量（去重后） |
| unique_ips | int, default 0 | 独立IP数 |
| created_at | datetime | 创建时间 |

**IP 防重放策略：**
- 同一 IP + 同一 page_path 在 **5 分钟时间窗口** 内仅计 1 次有效访问
- 实现方式：服务端在插入前查询 `tracking_events` 表，检查同 IP+page_path 在最近 5 分钟内是否已有记录
- 可选优化：使用内存缓存（dict/TTLCache）做前置过滤，减少数据库查询压力
- 接口返回统一成功响应（不暴露是否被去重，防止探测）

---

## 4. API 接口设计

### 4.1 认证模块 `/api/v1/auth`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /login | 用户登录，返回 access_token + refresh_token | 公开 |
| POST | /refresh | 刷新 access_token | 需要 refresh_token |
| POST | /logout | 登出（将 refresh_token 加入黑名单） | 需登录 |
| GET | /me | 获取当前用户信息（含角色权限） | 需登录 |
| PUT | /me | 更新当前用户信息（密码/头像） | 需登录 |

**Token 策略：**
- access_token 有效期：30 分钟
- refresh_token 有效期：7 天
- refresh_token 存储在 HTTP-Only Cookie 中
- access_token 通过 Authorization: Bearer 头传递

### 4.2 用户管理 `/api/v1/users`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 用户列表（分页/搜索） | `user:read` |
| POST | / | 创建用户 | `user:create` |
| GET | /{id} | 用户详情 | `user:read` |
| PUT | /{id} | 更新用户 | `user:update` |
| DELETE | /{id} | 删除用户（软删除） | `user:delete` |
| PUT | /{id}/roles | 分配角色 | `user:update` |

### 4.3 角色权限 `/api/v1/roles`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 角色列表 | `role:read` |
| POST | / | 创建角色 | `role:create` |
| PUT | /{id} | 更新角色 | `role:update` |
| DELETE | /{id} | 删除角色 | `role:delete` |
| PUT | /{id}/permissions | 分配权限 | `role:update` |
| GET | /permissions | 所有权限列表 | `role:read` |

### 4.4 Banner 管理 `/api/v1/banners`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | Banner列表（分页） | `banner:read` |
| POST | / | 创建Banner | `banner:create` |
| PUT | /{id} | 更新Banner | `banner:update` |
| DELETE | /{id} | 删除Banner | `banner:delete` |
| PUT | /{id}/sort | 调整排序 | `banner:update` |

### 4.5 新闻资讯 `/api/v1/news`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 文章列表（分页/筛选/搜索） | `news:read` |
| POST | / | 创建文章 | `news:create` |
| GET | /{id} | 文章详情 | `news:read` |
| PUT | /{id} | 更新文章 | `news:update` |
| DELETE | /{id} | 删除文章 | `news:delete` |
| PUT | /{id}/status | 发布/下架/归档 | `news:update` |
| GET | /stats | 文章浏览量统计 | `news:read` |

### 4.6 联系我们 `/api/v1/contacts`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 表单提交列表（分页/筛选） | `contact:read` |
| GET | /{id} | 表单详情 | `contact:read` |
| PUT | /{id}/status | 标记已读/已回复 | `contact:update` |
| PUT | /{id}/reply | 回复留言 | `contact:update` |
| DELETE | /{id} | 删除记录 | `contact:delete` |

### 4.7 帮助中心 `/api/v1/help`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /categories | 分类列表 | `help:read` |
| POST | /categories | 创建分类 | `help:create` |
| PUT | /categories/{id} | 更新分类 | `help:update` |
| DELETE | /categories/{id} | 删除分类 | `help:delete` |
| GET | /questions | 问题列表（按分类/搜索） | `help:read` |
| POST | /questions | 添加问题 | `help:create` |
| PUT | /questions/{id} | 更新问题 | `help:update` |
| DELETE | /questions/{id} | 删除问题 | `help:delete` |

### 4.8 操作视频 `/api/v1/videos`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 视频列表（分页） | `video:read` |
| POST | / | 上传视频（含元数据） | `video:create` |
| GET | /{id} | 视频详情 | `video:read` |
| PUT | /{id} | 更新视频信息 | `video:update` |
| DELETE | /{id} | 删除视频 | `video:delete` |

### 4.9 站点配置 `/api/v1/site-config`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 获取所有配置 | `config:read` |
| PUT | /{key} | 更新配置项 | `config:update` |

### 4.10 文件上传 `/api/v1/upload`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /image | 上传图片（支持压缩/缩略图） | 需登录 |
| POST | /video | 上传视频（支持分片上传） | 需登录 |
| POST | /file | 上传通用文件 | 需登录 |

### 4.11 埋点接口 `/api/v1/tracking`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /event | 上报埋点事件（page_path 必填）| **公开（无需登录）** |

**请求体示例：**
```json
{
  "page_path": "/news/123",
  "referer": "https://example.com"
}
```

**防重放逻辑：**
- 服务端自动提取客户端 IP（从 `X-Forwarded-For` 或 `request.client.host`）
- 服务端自动提取 User-Agent
- 生成 fingerprint = `sha256(ip + page_path + 5分钟时间窗口key)`
- 若 fingerprint 已存在则静默忽略，返回 `{"ok": true}`
- 有效记录写入 `tracking_events` 表，同时异步更新 `daily_stats` 汇总

### 4.12 数据统计 `/api/v1/stats`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /overview | 总览数据（总浏览量/独立IP数/文章数等） | `stats:read` |
| GET | /trend | 趋势数据（按日/周/月） | `stats:read` |
| GET | /top-pages | 热门页面排行 | `stats:read` |

---

## 5. 前端页面设计

### 5.1 登录页 `/login`
- 居中登录表单（用户名 + 密码）
- 记住我功能（延长 refresh_token 有效期）
- 登录验证码（可选，后期扩展）

### 5.2 仪表盘 `/dashboard`
- **数据卡片区：** 总浏览量、独立IP数、文章总数、待处理联系表单数
- **趋势图表：** 近 7/30 天浏览量折线图（Recharts）
- **热门内容：** 浏览量 Top 10 文章排行
- **最新动态：** 最近的联系表单、最新发布的文章

### 5.3 Banner 管理 `/banners`
- 列表展示（带缩略图预览）
- 拖拽排序
- 图片上传（带裁剪预览）
- 启用/禁用开关

### 5.4 新闻资讯 `/news`
- **列表页：** 数据表格（标题、状态、浏览量、发布时间）+ 筛选/搜索
- **编辑页：** TipTap 富文本编辑器、封面图上传、分类/标签选择、状态管理

### 5.5 联系我们 `/contacts`
- 收件箱风格列表
- 详情查看 + 回复功能
- 未读/已读/已回复状态筛选

### 5.6 帮助中心 `/help`
- 左侧分类树 + 右侧问题列表
- 问题编辑（支持富文本答案）
- 拖拽排序

### 5.7 操作视频 `/videos`
- 卡片式列表（带视频封面缩略图）
- 视频上传（进度条显示）
- 视频预览播放

### 5.8 站点配置 `/site-config`
- 表单式配置页
- 二维码图片上传/预览
- 手机号、邮箱编辑

### 5.9 用户管理 `/users`
- 用户列表（分页/搜索）
- 创建/编辑用户表单
- 角色分配

### 5.10 角色权限 `/roles`
- 角色列表
- 权限分配（树形勾选）

### 5.11 公共布局
- **侧边栏：** 可折叠导航菜单，支持根据权限动态渲染菜单项
- **顶部栏：** 面包屑导航、用户头像下拉菜单（个人信息/退出）
- **主题：** 暗色主题为主，支持亮/暗模式切换

---

## 6. 文件存储设计

### 6.1 存储抽象层
定义统一的 `StorageBackend` 接口：
```python
class StorageBackend(ABC):
    async def upload(self, file: UploadFile, path: str) -> str: ...
    async def delete(self, path: str) -> bool: ...
    async def get_url(self, path: str) -> str: ...
```

### 6.2 本地存储
- 文件存储到 `backend/uploads/` 目录
- 通过 FastAPI 的 StaticFiles 提供访问
- 路径格式：`/uploads/{type}/{yyyy}/{mm}/{uuid}.{ext}`

### 6.3 MinIO 存储
- 通过 `minio` Python SDK 操作
- Bucket 策略：`cybermind-images`、`cybermind-videos`
- 配置环境变量切换存储后端

---

## 7. 安全设计

### 7.1 认证流程
1. 用户提交 **username（登录账号）** + 密码
2. 服务端校验后生成 access_token（JWT，30分钟）和 refresh_token（7天）
3. access_token 通过响应体返回，前端存于内存/localStorage
4. refresh_token 通过 HTTP-Only Cookie 设置
5. 请求时通过 `Authorization: Bearer <access_token>` 认证
6. access_token 过期时，自动用 refresh_token 刷新
7. refresh_token 过期需重新登录

### 7.2 权限校验
- 每个 API 路由通过 `Depends()` 声明所需权限
- 中间件提取 Token → 解析用户 → 查询角色权限 → 校验
- 权限代码格式：`{module}:{action}`，如 `banner:create`

### 7.3 密码安全
- 使用 `passlib[bcrypt]` 加密存储
- 密码长度最少 8 位

---

## 8. Docker 编排设计

### 8.1 docker-compose.yml 服务定义
- **mysql**: MySQL 8.0 数据库
- **minio**: MinIO 对象存储（可选）
- **backend**: FastAPI 后端服务
- **frontend**: Nginx 托管前端构建产物
- **redis**: Redis（用于 refresh_token 黑名单缓存，可选后期加入）

### 8.2 开发模式
- `docker-compose.dev.yml` 覆盖文件用于开发环境
- 后端挂载代码目录，支持热重载
- 前端使用 Vite dev server（端口 5173）

### 8.3 生产模式
- 前端构建为静态文件，Nginx 托管
- 后端通过 Uvicorn 运行
- Nginx 作为反向代理，统一入口

---

## 9. 权限代码预置

```
# 模块权限列表
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

预置角色：
- **超级管理员 (super_admin)**：拥有所有权限
- **内容管理员 (content_admin)**：banner/news/help/video 的完整 CRUD
- **客服 (customer_service)**：contact:read, contact:update

---

## 10. 开发计划子系统划分

由于本项目包含多个相对独立的子系统，建议按以下顺序分阶段实施：

**阶段一：基础设施（优先）**
1. 项目脚手架（Monorepo + Docker Compose + uv + Vite）
2. 数据库设计与迁移（Alembic）
3. 认证系统（JWT 双Token + 登录页）
4. RBAC 权限系统（用户/角色/权限管理）
5. 文件存储抽象层（本地 + MinIO）
6. 前端基础布局（侧边栏 + 路由 + 权限菜单）

**阶段二：核心业务模块**
7. Banner 管理模块
8. 新闻资讯模块（含富文本编辑器）
9. 联系我们模块
10. 帮助中心模块
11. 操作视频模块
12. 站点配置模块

**阶段三：数据与优化**
13. 访问统计中间件与统计 API
14. 仪表盘数据看板
15. Docker 生产部署配置
