FROM node:24-bookworm-slim AS build

WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NODE_OPTIONS=--max-old-space-size=1024
ENV CI=true
ENV LEFTHOOK=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN corepack pnpm install --frozen-lockfile

COPY . .
RUN corepack pnpm --filter @online-resume/shared build
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder corepack pnpm --filter @online-resume/api build
RUN corepack pnpm --filter @online-resume/web build

FROM node:24-bookworm-slim AS api

WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json

WORKDIR /app/apps/api
USER node
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --config ../../prisma.config.ts && node dist/seed.js && node dist/main.js"]

FROM caddy:2-alpine AS web

COPY infra/caddy/Caddyfile.coolify /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv

EXPOSE 80
