# ⬜ TASK-08.4 — Таблица кандидатов

Status: [ ] todo  
Priority: Medium  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить таблицу кандидатов в dashboard с агрегированными метриками по интервью, score и статусу shortlist.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Таблица кандидатов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/candidates/CandidatesPage.tsx`
- `frontend/src/entities/candidate/api/candidatesApi.ts`
- `backend/src/modules/candidates/graphql/candidates-dashboard.resolver.ts`
- `backend/src/modules/candidates/repositories/candidates-dashboard.repository.ts`

## Requirements

1. Поля таблицы: candidate, interviews_count, avg_score, last_interview_date, shortlist_status.
2. Фильтры: skill/topic/score range/shortlisted only.
3. Сортировка по `avg_score` и `last_interview_date`.
4. Пагинация аналогична странице интервью.
5. Строка кандидата открывает candidate report page.
6. Для `avg_score` использовать финальные оценки из `final_evaluations`.

## Step-by-step Plan

1. Реализовать backend агрегирующий query по кандидатам.
2. Подключить RTK Query endpoint.
3. Собрать UI фильтров и таблицы.
4. Добавить форматирование score и даты.
5. Проверить переход к report странице кандидата.

## Acceptance Criteria

- Рекрутер видит агрегированный список кандидатов.
- Фильтры и сортировка работают корректно.
- Переход к отчету кандидата доступен из таблицы.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
