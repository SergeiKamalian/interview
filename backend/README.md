# AI Interviewer Backend

NestJS backend для AI Interviewer Platform: GraphQL API, MySQL (raw SQL), Redis, SQL migrations.

**Эталон backend:** `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back` — структура modules, migrations, config.

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
# Вариант 1 — один скрипт: infra + migrate + backend + frontend (как captcha-back)
pnpm dev:local

# или из backend/
pnpm run dev:local

# Вариант 2 — только backend вручную
docker compose up -d mysql redis
cp .env.example backend/.env
cd backend
pnpm install
pnpm run migrate
pnpm run start:dev
```

`dev:local` создаёт `.env` и `backend/.env` из examples, если их ещё нет, поднимает `mysql` и `redis` через docker compose, прогоняет миграции, останавливает docker-контейнер `backend` (если занят порт `3000`), затем параллельно запускает NestJS и Vite.

Локальный compose изолирован от `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`:

- Compose project: `ai-interviewer-local`
- MySQL host port: `3322` (`captcha-back` использует `3306`)
- Redis host port: `6392` (`captcha-back` использует `6379`)
- Backend port: `3000` (`captcha-back` обычно использует `6060`)
- Frontend port: `5174` (`captcha-panel` обычно использует `5173`)

Переменные окружения для скрипта (optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_DIR` | `../frontend` | Путь к frontend |
| `FRONTEND_PORT` | `5174` | Vite port |
| `PORT` | `3000` | Backend port |
| `COMPOSE_PROJECT_NAME` | `ai-interviewer-local` | Docker Compose project name |
| `SKIP_DOCKER` | `0` | `1` — не трогать docker compose |
| `SKIP_MIGRATE` | `0` | `1` — пропустить migrate |

Endpoints после старта:

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3000`
- GraphQL Playground: `http://localhost:3000/graphql` (если `GRAPHQL_PLAYGROUND=true`)

Endpoints:

- `GET /health` — uptime, version, mysql/redis status
- `POST /graphql` — GraphQL API
- `GET /graphql` + `Accept: text/html` — Playground (если `GRAPHQL_PLAYGROUND=true`)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev:local` | Docker mysql/redis + migrate + backend + frontend |
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
| `MYSQL_PORT` | yes | `3322` | MySQL port for local host access (`3306` in Docker) |
| `MYSQL_USER` | yes | `ai_interviewer` | MySQL user |
| `MYSQL_PASSWORD` | yes | `changeme` | MySQL password |
| `MYSQL_DATABASE` | yes | `ai_interviewer` | Database name |
| `MYSQL_ROOT_PASSWORD` | docker | `root` | Root password (docker-compose only) |
| `REDIS_HOST` | yes | `localhost` | Redis host (`redis` in Docker) |
| `REDIS_PORT` | yes | `6392` | Redis port for local host access (`6379` in Docker) |
| `REDIS_PASSWORD` | no | — | Redis password (if set) |
| `JWT_SECRET` | yes | `local-dev-secret` | Access token signing secret |
| `JWT_EXPIRES_IN` | no | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | yes | `local-dev-refresh-secret` | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | no | `7d` | Refresh token TTL |
| `GRAPHQL_PLAYGROUND` | no | `true` | Enable GraphQL playground |
| `LOG_LEVEL` | no | `log` | Nest log level |
| `AI_PROVIDER` | yes | `openai` | `openai` \| `compatible` (OpenAI-compatible API) |
| `AI_API_KEY` | yes | — | Provider API key (never logged) |
| `AI_MODEL_EVALUATION` | yes | `gpt-4o-mini` | Model for checkpoint/final evaluation |
| `AI_TIMEOUT_MS` | yes | `30000` | HTTP timeout per AI request (ms) |
| `AI_BASE_URL` | no | `https://api.openai.com/v1` | Override for compatible providers |
| `AI_MAX_RETRIES` | no | `2` | Retries on 429/5xx |
| `AI_TEMPERATURE` | no | `0` | Sampling temperature (0–2) |

Полный шаблон: [backend/.env.example](./.env.example)

## DataGrip / MySQL client

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `3322` |
| Database | `ai_interviewer` |
| User | `ai_interviewer` |
| Password | `changeme` |

На macOS с Docker MySQL предпочтительнее `localhost`, не `127.0.0.1`.

## Docker image

```bash
docker build -t ai-interviewer-backend ./backend
docker run --rm -p 3000:3000 --env-file backend/.env ai-interviewer-backend
```
