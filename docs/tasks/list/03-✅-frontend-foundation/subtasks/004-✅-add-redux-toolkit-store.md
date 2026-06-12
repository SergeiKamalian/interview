# ✅ TASK-03.4 — Настройка Redux Toolkit store

Status: [x] done  
Priority: High  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать Redux store с `configureStore`, typed hooks `useAppDispatch`/`useAppSelector` и Provider в root.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Настройка Redux Toolkit store» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/app/store/index.ts`
- `frontend/src/app/store/hooks.ts`
- `frontend/src/main.tsx`

## Requirements

1. Пакеты: `@reduxjs/toolkit`, `react-redux`.
2. Пустой root reducer или ui slice stub.
3. Redux DevTools в dev.
4. Export `RootState`, `AppDispatch` types.

## Step-by-step Plan

1. Установить RTK + react-redux.
2. Создать store и hooks.
3. Обернуть App в Provider.
4. Проверить DevTools.

## Acceptance Criteria

- Store подключён к React tree.
- Typed hooks работают.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
