# ⬜ TASK-01.8 — Таблица schema_migrations

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать bootstrap-миграцию `001_create_schema_migrations.sql` с таблицей учёта применённых миграций.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Таблица schema_migrations» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/migrations/001_create_schema_migrations.sql`

## Requirements

1. Таблица `schema_migrations`: `id BIGINT AUTO_INCREMENT PK`, `version VARCHAR(64) UNIQUE`, `applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
2. Индекс на `version`.
3. Миграция идемпотентна (`CREATE TABLE IF NOT EXISTS`).
4. После apply — запись `001_create_schema_migrations` в таблице.

## Step-by-step Plan

1. Создать SQL файл миграции.
2. Запустить `npm run migrate`.
3. Проверить `SELECT * FROM schema_migrations`.
4. Повторный migrate — 0 новых миграций.

## Acceptance Criteria

- Таблица `schema_migrations` существует.
- Версия 001 записана.
- Повторный runner не дублирует.

## Checks

```bash
cd backend && npm run migrate
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SELECT * FROM schema_migrations'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
