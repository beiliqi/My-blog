# --- 构建阶段 ---------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# 国内网络可用 npmmirror，海外可用官方源
ARG NPM_REGISTRY=https://registry.npmmirror.com
# canonical / RSS / sitemap 里的绝对地址来自构建期，换域名必须重新构建
ARG SITE_URL=https://blog.example.com

COPY package.json package-lock.json ./
RUN npm config set registry "$NPM_REGISTRY" \
 && npm ci --no-audit --no-fund

COPY . .
RUN SITE_URL="$SITE_URL" npm run build

# --- 运行阶段 ---------------------------------------------------------------
FROM nginx:1.29-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
