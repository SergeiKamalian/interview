# ⬜ TASK-08.5 — Страница отчета кандидата

Status: [ ] todo  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать candidate report page: профиль кандидата, история интервью, итоговые рекомендации и shortlist actions.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Страница отчета кандидата» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/candidates/CandidateReportPage.tsx`
- `frontend/src/entities/candidate/api/candidateReportApi.ts`
- `backend/src/modules/candidates/graphql/candidate-report.resolver.ts`
- `backend/src/modules/candidates/repositories/candidate-report.repository.ts`
- `backend/src/modules/shortlist/`

## Requirements

1. Route: `/dashboard/candidates/:candidateId/report`.
2. Query возвращает candidate profile + список интервью + latest final evaluation.
3. Секция recommendations показывает сильные стороны, риски, next steps.
4. Action buttons: `Add to shortlist`, `Remove from shortlist`, `Add recruiter note`.
5. Изменение shortlist статуса пишется в отдельную таблицу `candidate_shortlist_events`.
6. Только пользователи компании-владельца могут редактировать shortlist.

## Step-by-step Plan

1. Создать backend query и mutation для shortlist actions.
2. Собрать frontend страницу отчета с секциями overview/history/recommendation.
3. Добавить optimistic update для shortlist badge.
4. Добавить confirm dialog на удаление из shortlist.
5. Проверить доступы и edge case отсутствующего кандидата.

## Acceptance Criteria

- Отчет кандидата покрывает ключевые hiring-сигналы.
- Shortlist действия работают и аудируются.
- Страница защищена по company scope.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test -- candidate-report
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
