# ✅ TASK-03.5 — Базовая настройка RTK Query

Status: [x] done  
Priority: High  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать `baseApi` slice с `createApi`, reducer middleware и inject endpoints pattern для features.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовая настройка RTK Query» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/shared/api/baseApi.ts`
- `frontend/src/app/store/index.ts`

## Requirements

1. `createApi` с `reducerPath: 'api'`.
2. Пустой `endpoints: () => ({})` — для inject.
3. Подключить reducer + middleware в store.
4. Tag types stub: `['Health']`.

## Step-by-step Plan

1. Создать baseApi.ts.
2. Подключить в store.
3. Проверить store содержит api reducer.

## Acceptance Criteria

- baseApi зарегистрирован в store.
- Middleware подключён.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
