# ⬜ TASK-01.6 — Модуль подключения Redis

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать `RedisModule` с `ioredis` client, ping при старте и статусом в health endpoint.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Модуль подключения Redis» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/common/redis/redis.module.ts`
- `backend/src/common/redis/redis.service.ts`
- `backend/src/app.module.ts`
- `backend/src/modules/health/health.service.ts`

## Requirements

1. Пакет: `ioredis`.
2. Config: `REDIS_HOST`, `REDIS_PORT`, опционально `REDIS_PASSWORD`.
3. `RedisService.ping()` → boolean.
4. `onModuleDestroy`: disconnect.
5. Health JSON: `redis: 'up'|'down'`.

## Step-by-step Plan

1. Установить `ioredis`.
2. Создать RedisModule (global).
3. Реализовать ping.
4. Обновить HealthService.
5. Проверить с docker redis.

## Acceptance Criteria

- Redis client подключается.
- Health показывает redis status.
- Ping успешен при запущенном redis.

## Checks

```bash
cd backend && npm run build
curl -s http://localhost:3000/health | jq .
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
