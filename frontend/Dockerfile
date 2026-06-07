# Stage 1: Build front-end static files
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack to get pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package config and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
