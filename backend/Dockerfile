# syntax=docker/dockerfile:1.7
# ── Etapa 1: dependencias + build ────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev

# ── Etapa 2: imagen de ejecución mínima ──────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health/live >/dev/null || exit 1
# Aplica migraciones pendientes y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
