FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.6.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile --filter @online-resume/api...

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

RUN pnpm --filter @online-resume/shared build \
  && pnpm --filter @online-resume/api db:generate \
  && pnpm --filter @online-resume/api build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/prisma ./prisma

WORKDIR /app/apps/api

CMD ["node", "dist/main.js"]
