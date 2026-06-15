# ✅ TASK-08.8 — Отображение score/category/recommendation

Status: [x] done  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить визуализацию итогового score, разбивку по категориям и финальную recommendation карточку.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Отображение score/category/recommendation» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/widgets/score/OverallScoreCard.tsx`
- `frontend/src/widgets/score/CategoryBreakdownChart.tsx`
- `frontend/src/widgets/score/RecommendationCard.tsx`
- `frontend/src/entities/evaluation/api/finalEvaluationApi.ts`

## Requirements

1. Overall score отображается в шкале 0-100 с цветовой зоной.
2. Category breakdown строится из `category_scores` (skill/topic).
3. Recommendation badge: `Strong Hire`, `Hire`, `Hold`, `No Hire`.
4. Показывать confidence/consistency индикатор, если доступен.
5. UI должен объяснять, что recommendation основана на structured checkpoints, а не на свободном тексте.
6. При отсутствии финальной оценки показывать skeleton + retry action.

## Step-by-step Plan

1. Создать виджеты score/recommendation и подключить data endpoint.
2. Добавить chart компонент для category breakdown.
3. Интегрировать в interview details и candidate report.
4. Добавить tooltip с формулой оценки (high level).
5. Проверить accessibility для цветовых статусов (иконки + текст).

## Acceptance Criteria

- Итоговая оценка читается за 5-10 секунд.
- Категориальная разбивка помогает принять решение.
- Recommendation прозрачно объясняется.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run test -- score-widgets
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
