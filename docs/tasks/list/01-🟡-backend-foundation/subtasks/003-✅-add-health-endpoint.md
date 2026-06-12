# ⬜ TASK-01.3 — Health endpoint для мониторинга

Status: [ ] todo  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить REST `GET /health` с проверкой uptime и версии приложения; задел для DB/Redis checks в следующих subtasks.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Health endpoint для мониторинга» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/modules/health/health.module.ts`
- `backend/src/modules/health/health.controller.ts`
- `backend/src/modules/health/health.service.ts`
- `backend/src/app.module.ts`

## Requirements

1. Маршрут: `GET /health` (не GraphQL).
2. Ответ JSON: `{ status: 'ok', uptime: number, timestamp: ISO, version?: string }`.
3. HTTP 200 при healthy.
4. Не требует авторизации.
5. Swagger decorator опционально (`@ApiTags('health')`).

## Step-by-step Plan

1. Создать `HealthModule`, `HealthController`, `HealthService`.
2. Зарегистрировать в `AppModule`.
3. Реализовать `getHealth()` с `process.uptime()`.
4. Проверить curl `GET /health` → 200 + JSON.

## Acceptance Criteria

- `GET /health` возвращает 200 и валидный JSON.
- Endpoint доступен без auth.
- Модуль изолирован в `src/modules/health/`.

## Checks

```bash
curl -s http://localhost:3000/health | jq .
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
