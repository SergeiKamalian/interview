# ⬜ TASK-08.1 — Страницы company dashboard

Status: [ ] todo  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать каркас dashboard страниц и роутов для company пользователя с защищенным layout и breadcrumb-навигацией.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Страницы company dashboard» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/index.tsx`
- `frontend/src/pages/dashboard/interviews/InterviewsPage.tsx`
- `frontend/src/pages/dashboard/candidates/CandidatesPage.tsx`
- `frontend/src/pages/dashboard/analytics/AnalyticsPage.tsx`
- `frontend/src/app/router/routes.tsx`
- `frontend/src/widgets/layouts/DashboardLayout.tsx`

## Requirements

1. Routes: `/dashboard`, `/dashboard/interviews`, `/dashboard/candidates`, `/dashboard/analytics`.
2. Роуты доступны только авторизованному company user.
3. DashboardLayout содержит sidebar, header, breadcrumbs placeholder.
4. Каждая страница имеет loading/error/empty scaffolding.
5. Навигация сохраняет active state и поддерживает прямой deep link.
6. UI соответствует базовым компонентам блока 02.

## Step-by-step Plan

1. Добавить route entries и lazy imports для dashboard страниц.
2. Создать страницы-заглушки с базовым контентом и skeleton.
3. Связать страницы с `DashboardLayout`.
4. Проверить редирект неавторизованных пользователей.
5. Проверить прямое открытие `/dashboard/interviews`.

## Acceptance Criteria

- Dashboard роутинг работает для company user.
- Layout и навигация единообразны для всех dashboard страниц.
- Есть корректные empty/loading/error состояния.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
