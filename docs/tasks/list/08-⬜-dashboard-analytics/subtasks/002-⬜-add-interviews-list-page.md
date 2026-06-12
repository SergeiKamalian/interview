# ⬜ TASK-08.2 — Страница списка интервью

Status: [ ] todo  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать страницу списка интервью с server-side фильтрами, сортировкой и пагинацией по компании.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Страница списка интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/interviews/InterviewsPage.tsx`
- `frontend/src/entities/interview/api/interviewsApi.ts`
- `frontend/src/entities/interview/model/interview.types.ts`
- `backend/src/modules/interviews/graphql/interviews-dashboard.resolver.ts`
- `backend/src/modules/interviews/repositories/interviews-dashboard.repository.ts`

## Requirements

1. GraphQL query `companyInterviews` принимает `status`, `dateFrom`, `dateTo`, `search`, `page`, `pageSize`, `sort`.
2. В таблице отображать: role, candidate name/email, status, started_at, completed_at, overall_score.
3. Данные ограничены текущей `company_id` пользователя.
4. Пагинация возвращает `items`, `total`, `page`, `pageSize`.
5. Сортировка по `created_at` и `overall_score`.
6. Поддержка debounced search по candidate и роли.

## Step-by-step Plan

1. Добавить backend resolver/repository для выборки интервью dashboard scope.
2. Создать RTK Query endpoint и типы ответа.
3. Собрать UI таблицу + фильтры + пагинацию.
4. Добавить кликабельный переход на details страницу интервью.
5. Проверить empty state и API error handling.

## Acceptance Criteria

- Список интервью загружается с корректными фильтрами/пагинацией.
- Компания видит только свои данные.
- Из таблицы можно перейти к деталям интервью.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test -- interviews-page
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
