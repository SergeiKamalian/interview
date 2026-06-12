# ⬜ TASK-08.9 — Аналитика по темам/навыкам/вопросам

Status: [ ] todo  
Priority: Medium  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Построить аналитическую страницу по quality сигналам: performance по topics, skills и конкретным вопросам интервью.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Аналитика по темам/навыкам/вопросам» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/analytics/AnalyticsByTopicSkillQuestionPage.tsx`
- `frontend/src/entities/analytics/api/topicSkillQuestionApi.ts`
- `backend/src/modules/analytics/graphql/topic-skill-question.resolver.ts`
- `backend/src/modules/analytics/repositories/topic-skill-question.repository.ts`

## Requirements

1. Метрики: avg score, pass rate checkpoint, weak topics, strongest skills.
2. Фильтры: период, должность, уровень seniority, question set.
3. Drill-down: topic -> skill -> question.
4. Source данные из `question_evaluations` и `checkpoint_results` + question bank metadata.
5. Считать только интервью со статусом `completed`.
6. Добавить warning если sample size ниже минимального порога.

## Step-by-step Plan

1. Реализовать backend агрегационный query с group by topic/skill/question.
2. Добавить frontend charts/tables для drill-down.
3. Сделать единый filter bar с URL-синхронизацией.
4. Оптимизировать запросы для больших объемов (indexes/materialized strategy optional).
5. Проверить корректность на тестовых данных с разными ролями.

## Acceptance Criteria

- Доступна аналитика качества интервью по ключевым измерениям.
- Drill-down позволяет найти проблемные вопросы.
- Метрики соответствуют данным AI evaluation storage.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
