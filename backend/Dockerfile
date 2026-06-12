# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY migrations ./migrations

RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nestjs

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
