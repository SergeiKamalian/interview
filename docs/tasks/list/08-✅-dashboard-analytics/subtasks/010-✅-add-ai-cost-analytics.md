# ✅ TASK-08.10 — Аналитика стоимости AI

Status: [x] done  
Priority: Medium  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить cost analytics по AI usage: расходы по периодам, моделям и типам задач оценки.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Аналитика стоимости AI» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/analytics/AiCostAnalyticsPage.tsx`
- `frontend/src/entities/analytics/api/aiCostApi.ts`
- `backend/src/modules/analytics/graphql/ai-cost.resolver.ts`
- `backend/src/modules/analytics/repositories/ai-cost.repository.ts`

## Requirements

1. Метрики: total cost USD, cost per interview, cost per candidate, tokens by model.
2. Фильтры: date range, model, provider, company.
3. Source таблица: `ai_usage_logs`.
4. Показать top expensive interviews и аномалии latency/cost.
5. Currency отображать с 4 знаками после запятой.
6. Все расчеты выполняются на backend, frontend только визуализирует.

## Step-by-step Plan

1. Реализовать backend query агрегатов по `ai_usage_logs`.
2. Создать frontend страницу cost analytics с KPI cards и chart.
3. Добавить таблицу топ интервью по стоимости.
4. Проверить корректность totals vs raw logs.
5. Добавить empty state для компаний без AI usage.

## Acceptance Criteria

- Рекрутер видит прозрачную картину AI расходов.
- Можно найти дорогие сценарии и оптимизировать их.
- Аналитика согласована с usage логами.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test -- ai-cost
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
