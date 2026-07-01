# 开发阶段
FROM python:3.12-slim AS development

WORKDIR /app

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:0.11.23 /uv /usr/local/bin/uv

# 🌟 核心：在这里加入清华源环境变量，这样接下来的 uv sync 就会走国内源
ENV UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple/

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

COPY --from=ghcr.io/astral-sh/uv:0.11.23 /uv /usr/local/bin/uv

# 🌟 核心：生产阶段也同样需要加上源环境变量
ENV UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
