# ✅ TASK-08.3 — Страница деталей интервью

Status: [x] done  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать страницу деталей интервью с карточкой кандидата, метаданными интервью и summary AI-оценки.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Страница деталей интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/interviews/InterviewDetailsPage.tsx`
- `frontend/src/entities/interview/api/interviewDetailsApi.ts`
- `backend/src/modules/interviews/graphql/interview-details.resolver.ts`
- `backend/src/modules/interviews/repositories/interview-details.repository.ts`

## Requirements

1. Route: `/dashboard/interviews/:interviewId`.
2. GraphQL query возвращает interview meta, candidate profile, final evaluation, progress indicators.
3. Проверка доступа: interview.company_id должен совпадать с текущим user.company_id.
4. UI блоки: header, timeline, overall score card, recommendation badge.
5. Обработка состояния `evaluation_pending` для незавершенной AI-оценки.
6. Ссылки на related pages: transcript/checkpoint/results.

## Step-by-step Plan

1. Реализовать backend query для детальной выборки интервью.
2. Добавить frontend endpoint и типизацию.
3. Собрать страницу с компоновкой из карточек/секций.
4. Добавить guard для 404/forbidden.
5. Проверить deep-link и обновление страницы.

## Acceptance Criteria

- Детальная страница интервью доступна и информативна.
- Права доступа соблюдаются.
- UI корректно обрабатывает pending/ready состояние оценки.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
