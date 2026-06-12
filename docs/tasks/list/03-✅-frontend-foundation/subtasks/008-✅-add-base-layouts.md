# ✅ TASK-03.8 — Базовые layouts

Status: [x] done  
Priority: Medium  
Parent block: `03-✅-frontend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать `AuthLayout`, `DashboardLayout`, `PublicLayout` с outlet и общей навигацией-заглушкой.

## Context

Dashboard и public candidate flow будут потреблять GraphQL API backend. RTK Query — единый data layer; REST только для upload/health. Структура папок — FSD-like: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.

Эта подзадача — часть блока `03-✅-frontend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовые layouts» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth forms и protected routes (блок 04).
- Question bank UI (блок 05).
- Interview public flow (блок 06).
- Dashboard pages (блок 08).
- Voice/video (блок 09).

## Files / Folders Allowed

- `frontend/src/widgets/layouts/AuthLayout.tsx`
- `frontend/src/widgets/layouts/DashboardLayout.tsx`
- `frontend/src/widgets/layouts/PublicLayout.tsx`
- `frontend/src/app/router/routes.tsx`

## Requirements

1. AuthLayout: centered card для login/register.
2. DashboardLayout: sidebar + header stub.
3. PublicLayout: minimal header для candidate flow.
4. Nested routes с layout components.

## Step-by-step Plan

1. Создать 3 layout компонента.
2. Привязать к routes.
3. Проверить визуально в dev.

## Acceptance Criteria

- Каждый layout рендерит `<Outlet />`.
- Routes используют правильный layout.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
