# ⬜ TASK-01.7 — SQL migration runner

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать CLI migration runner: читает `backend/migrations/*.sql`, применяет в порядке версии, логирует результат.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «SQL migration runner» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/migrate/main.ts`
- `backend/src/migrate/migration-runner.service.ts`
- `backend/migrations/`
- `backend/package.json` (script `migrate`)
- `docker/migrate/Dockerfile` (optional stub)

## Requirements

1. Формат файлов: `001_description.sql`, `002_...sql` — версия = числовой prefix.
2. Runner: SELECT applied versions FROM `schema_migrations`, apply pending, INSERT version.
3. Транзакция на каждую миграцию.
4. npm script: `npm run migrate`.
5. Exit code 1 при ошибке SQL.

## Step-by-step Plan

1. Создать `migration-runner.service.ts`.
2. Создать entrypoint `src/migrate/main.ts`.
3. Добавить script `migrate` в package.json.
4. Создать папку `migrations/` с `.gitkeep`.
5. Прогнать runner на пустой БД (после subtask 008).

## Acceptance Criteria

- Runner применяет SQL файлы по порядку.
- Повторный запуск идемпотентен.
- Ошибка SQL → exit 1.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
