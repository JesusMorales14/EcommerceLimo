# syntax=docker/dockerfile:1.7
# ── Etapa 1: build de la SPA ─────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# production (API en la nube) | development (API en http://localhost:3000)
ARG BUILD_CONFIGURATION=production
RUN npx ng build --configuration ${BUILD_CONFIGURATION}

# ── Etapa 2: servidor estático (Nginx sin privilegios) ───────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
