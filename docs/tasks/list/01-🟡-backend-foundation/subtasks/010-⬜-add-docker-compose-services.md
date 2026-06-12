# ⬜ TASK-01.10 — docker-compose сервисы

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать корневой `docker-compose.yml` с сервисами mysql, redis, migrate, backend и volume для данных.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «docker-compose сервисы» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `docker-compose.yml`
- `docker-compose.override.yml` (optional dev)
- `.env` (root, gitignored)
- `.env.example` (root)

## Requirements

1. Сервисы: `mysql:8`, `redis:7`, `migrate` (one-shot), `backend` (depends_on migrate).
2. MySQL env: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE=ai_interviewer`.
3. Volumes: `mysql_data`.
4. Ports: backend 3000, mysql 3306, redis 6379.
5. migrate использует тот же образ/backend с CMD `npm run migrate`.

## Step-by-step Plan

1. Создать docker-compose.yml в корне monorepo.
2. Создать root `.env.example`.
3. Настроить depends_on + healthcheck mysql.
4. Проверить `docker compose up --build`.
5. Проверить health + graphql после полного старта.

## Acceptance Criteria

- `docker compose up` поднимает все сервисы.
- migrate выполняется до backend.
- Health и GraphQL доступны.

## Checks

```bash
docker compose config
docker compose up -d --build
curl -s http://localhost:3000/health
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -d '{"query":"{ hello }"}'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
