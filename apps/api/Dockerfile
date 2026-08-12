# Monorepo Dockerfile for @venatio/api
FROM node:20-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config ./packages/typescript-config/
COPY packages/eslint-config ./packages/eslint-config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app ./
COPY . .
RUN pnpm turbo run build --filter=@venatio/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/shared ./packages/shared
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["sh", "-c", "node dist/main.js"]
