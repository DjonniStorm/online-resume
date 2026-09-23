FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.6.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile --filter @online-resume/web...

COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

RUN pnpm --filter @online-resume/shared build \
  && pnpm --filter @online-resume/web build

FROM caddy:2-alpine

COPY infra/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
