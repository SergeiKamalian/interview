# ✅ TASK-03.9 — Конфигурация frontend env

Status: [x] done  
Priority: Medium  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить typed env module и `.env.example` с `VITE_GRAPHQL_URL`, `VITE_API_URL`, `VITE_APP_NAME`.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Конфигурация frontend env» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/shared/config/env.ts`
- `frontend/.env.example`
- `frontend/.env.development` (gitignored)

## Requirements

1. Валидация: throw в dev если `VITE_GRAPHQL_URL` отсутствует.
2. Export `env` object с readonly fields.
3. Документировать в frontend README stub.

## Step-by-step Plan

1. Создать env.ts.
2. Создать .env.example.
3. Подключить в graphqlBaseQuery.
4. Проверить dev с .env.development.

## Acceptance Criteria

- Env типизирован и валидируется.
- .env.example содержит все VITE_* ключи.

## Checks

```bash
test -f frontend/.env.example
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
