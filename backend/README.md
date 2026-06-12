# AI Interviewer Backend

NestJS backend для AI Interviewer Platform: GraphQL API, MySQL (raw SQL), Redis, SQL migrations.

Архитектурные решения: [docs/DECISIONS.md](../docs/DECISIONS.md) — SQL-first, без Prisma/ORM.

## Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop (для MySQL/Redis через compose)

## Quick start (Docker)

```bash
# из корня monorepo
cp .env.example .env
cp backend/.env.example backend/.env

docker compose up -d --build

curl http://localhost:3000/health
curl -s -X POST http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ hello }"}'
```

Сервисы: `mysql`, `redis`, `migrate` (one-shot), `backend`.

## Local dev (without Docker backend)

```bash
# 1. Поднять только инфраструктуру
docker compose up -d mysql redis

# 2. Env
cp .env.example backend/.env

# 3. Зависимости и миграции
cd backend
pnpm install
pnpm run migrate

# 4. Dev server
pnpm run start:dev
```

Endpoints:

- `GET /health` — uptime, version, mysql/redis status
- `POST /graphql` — GraphQL API
- `GET /graphql` + `Accept: text/html` — Playground (если `GRAPHQL_PLAYGROUND=true`)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run start:dev` | NestJS watch mode |
| `pnpm run build` | Production build → `dist/` |
| `pnpm run start:prod` | `node dist/main.js` |
| `pnpm run migrate` | Apply SQL migrations from `migrations/` |
| `pnpm run lint` | ESLint |

## Migrations

- SQL files: `backend/migrations/NNN_description.sql`
- Runner: `pnpm run migrate` (dev) / `node dist/migrate/main.js` (Docker)
- Tracking table: `schema_migrations`
- Повторный запуск идемпотентен

```bash
cd backend
pnpm run migrate

docker compose exec mysql mysql -uai_interviewer -pchangeme ai_interviewer \
  -e "SELECT * FROM schema_migrations;"
```

## Project structure

```txt
backend/
  src/
    main.ts                 # bootstrap
    app.module.ts
    common/
      config/               # env validation (Joi)
      database/             # MySQL pool (mysql2)
      redis/                # Redis client (ioredis)
      filters/              # REST + GraphQL exception filters
      logger/               # pino structured logging
    migrate/                # SQL migration CLI
    modules/
      health/               # GET /health
      graphql/              # Apollo GraphQL
  migrations/               # raw .sql files
  Dockerfile
```

## Environment variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | yes | `development` | `development` \| `production` \| `test` |
| `PORT` | yes | `3000` | HTTP port |
| `MYSQL_HOST` | yes | `localhost` | MySQL host (`mysql` in Docker) |
| `MYSQL_PORT` | yes | `3306` | MySQL port |
| `MYSQL_USER` | yes | `ai_interviewer` | MySQL user |
| `MYSQL_PASSWORD` | yes | `changeme` | MySQL password |
| `MYSQL_DATABASE` | yes | `ai_interviewer` | Database name |
| `MYSQL_ROOT_PASSWORD` | docker | `root` | Root password (docker-compose only) |
| `REDIS_HOST` | yes | `localhost` | Redis host (`redis` in Docker) |
| `REDIS_PORT` | yes | `6379` | Redis port |
| `REDIS_PASSWORD` | no | — | Redis password (if set) |
| `JWT_SECRET` | yes | `local-dev-secret` | Auth placeholder (block 04) |
| `GRAPHQL_PLAYGROUND` | no | `true` | Enable GraphQL playground |
| `LOG_LEVEL` | no | `log` | Nest log level |

Полный шаблон: [backend/.env.example](./.env.example)

## DataGrip / MySQL client

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `3306` |
| Database | `ai_interviewer` |
| User | `ai_interviewer` |
| Password | `changeme` |

На macOS с Docker MySQL предпочтительнее `localhost`, не `127.0.0.1`.

## Docker image

```bash
docker build -t ai-interviewer-backend ./backend
docker run --rm -p 3000:3000 --env-file backend/.env ai-interviewer-backend
```
