# ✅ TASK-03.3 — Подключение React Router

Status: [x] done  
Priority: High  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Настроить React Router v6 с `BrowserRouter`, route config и placeholder pages для `/`, `/login`, `/dashboard`.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Подключение React Router» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/app/router/index.tsx`
- `frontend/src/app/router/routes.tsx`
- `frontend/src/pages/home/HomePage.tsx`
- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/dashboard/DashboardPage.tsx`
- `frontend/src/App.tsx`

## Requirements

1. Пакет: `react-router-dom` v6.
2. Routes: `/`, `/login`, `/dashboard`, `*` → NotFound.
3. Lazy loading pages (optional).
4. `RouterProvider` или `BrowserRouter` в App.

## Step-by-step Plan

1. Установить react-router-dom.
2. Создать route config.
3. Создать placeholder pages.
4. Проверить навигацию по URL.

## Acceptance Criteria

- Маршруты `/`, `/login`, `/dashboard` рендерятся.
- 404 для unknown path.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
