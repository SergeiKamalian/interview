# ⬜ TASK-03.6 — GraphQL baseQuery для RTK Query

Status: [ ] todo  
Priority: High  
Parent block: `03-⬜-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать `graphqlBaseQuery` — POST JSON `{ query, variables }` на `VITE_GRAPHQL_URL` с обработкой GraphQL errors.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-⬜-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «GraphQL baseQuery для RTK Query» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/shared/api/graphqlBaseQuery.ts`
- `frontend/src/shared/api/baseApi.ts`
- `frontend/src/shared/config/env.ts`

## Requirements

1. URL из `import.meta.env.VITE_GRAPHQL_URL`.
2. Fetch wrapper с `credentials: 'include'` (задел).
3. Parse `errors[]` из GraphQL response.
4. Тестовый endpoint `getHello` → query `{ hello }`.

## Step-by-step Plan

1. Создать env.ts с VITE_GRAPHQL_URL.
2. Реализовать graphqlBaseQuery.
3. Добавить getHello endpoint в baseApi.
4. Проверить вызов с работающим backend.

## Acceptance Criteria

- baseQuery отправляет GraphQL запросы.
- getHello возвращает данные или понятную ошибку.

## Checks

```bash
cd frontend && npm run build
curl backend graphql hello (backend must be up)
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
