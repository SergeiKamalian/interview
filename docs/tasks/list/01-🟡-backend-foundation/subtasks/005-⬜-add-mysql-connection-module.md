# ⬜ TASK-01.5 — Модуль подключения MySQL

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать `DatabaseModule` с `mysql2` connection pool, health-проверкой и injectable `DatabaseService` для raw SQL запросов.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Модуль подключения MySQL» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/common/database/database.module.ts`
- `backend/src/common/database/database.service.ts`
- `backend/src/common/database/database.types.ts`
- `backend/src/app.module.ts`

## Requirements

1. Пакет: `mysql2` (promise API).
2. Pool config из env: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
3. `DatabaseService.query<T>(sql, params)` — typed wrapper.
4. `onModuleInit`: проверка `SELECT 1`.
5. `onModuleDestroy`: pool.end().
6. Расширить health: mysql status `up`/`down`.

## Step-by-step Plan

1. Установить `mysql2`.
2. Создать DatabaseModule (global).
3. Реализовать pool и query helper.
4. Подключить в AppModule.
5. Обновить HealthService: ping MySQL.
6. Проверить при запущенном docker mysql.

## Acceptance Criteria

- Pool подключается к MySQL из env.
- Health отражает статус MySQL.
- `DatabaseService.query` выполняет `SELECT 1`.

## Checks

```bash
cd backend && npm run build
curl -s http://localhost:3000/health | jq '.mysql // .checks.mysql'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
