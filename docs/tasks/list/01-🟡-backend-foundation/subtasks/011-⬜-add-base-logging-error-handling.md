# ⬜ TASK-01.11 — Базовое логирование и обработка ошибок

Status: [ ] todo  
Priority: Medium  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить structured logging и глобальные фильтры исключений для REST и GraphQL с единым JSON-форматом ошибок.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовое логирование и обработка ошибок» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/common/filters/all-exceptions.filter.ts`
- `backend/src/common/filters/graphql-exception.filter.ts`
- `backend/src/common/logger/logger.module.ts`
- `backend/src/main.ts`

## Requirements

1. Logger: nestjs-pino или winston — JSON в production, pretty в dev.
2. AllExceptionsFilter: map HttpException → status + message.
3. GraphQL: `GqlExceptionFilter` — не leak stack в prod.
4. Логировать requestId (optional middleware).
5. Не логировать пароли, JWT, API keys.

## Step-by-step Plan

1. Установить logger пакет.
2. Создать filters и подключить в main.ts.
3. Проверить 404 REST → structured error.
4. Проверить GraphQL error → formatted response.

## Acceptance Criteria

- Ошибки форматируются единообразно.
- Stack trace скрыт в production.
- Секреты не попадают в логи.

## Checks

```bash
cd backend && npm run build
curl -s http://localhost:3000/nonexistent
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
