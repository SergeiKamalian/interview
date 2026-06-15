# ✅ TASK-08.7 — Отображение checkpoint-результатов

Status: [x] done  
Priority: High  
Parent block: `08-⬜-dashboard-analytics`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать UI explainability для checkpoint результатов: статус выполнения критериев, confidence и цитаты evidence.

## Context

После блоков 07-07 в системе есть интервью, ответы кандидатов и результаты AI-оценки. Блок 08 превращает эти данные в рабочий интерфейс для hiring team: от таблицы интервью до кандидата report page и shortlist действий.

Эта подзадача — часть блока `08-⬜-dashboard-analytics` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Отображение checkpoint-результатов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Создание question bank (блок 05).
- Public candidate interview UI (блок 06).
- Voice/video capture и playback controls (блок 09, кроме отображения ссылок).
- Внешние BI-дэшборды (Looker/PowerBI).

## Files / Folders Allowed

- `frontend/src/widgets/checkpoints/CheckpointResultsPanel.tsx`
- `frontend/src/entities/evaluation/api/checkpointResultsApi.ts`
- `backend/src/modules/ai-evaluation/graphql/checkpoint-results.resolver.ts`

## Requirements

1. Отображать group-by вопрос: список checkpoints со статусом `met/partially/not_met`.
2. Для каждого checkpoint показывать `evidence_quote` и `reasoning_short`.
3. Color coding статусов и legend для рекрутера.
4. Фильтр: только проблемные checkpoint (`not_met`, `partially_met`).
5. Клик по checkpoint синхронизирует transcript panel на нужный фрагмент.
6. Для `needs_manual_review` отображать warning badge.

## Step-by-step Plan

1. Добавить backend query получения checkpoint результатов по interview/question.
2. Создать RTK Query endpoint и типы.
3. Собрать `CheckpointResultsPanel` с группировкой и фильтрами.
4. Интегрировать с transcript panel через shared state/URL params.
5. Проверить мобильную адаптацию и горизонтальный скролл таблицы.

## Acceptance Criteria

- Explainability по checkpoints доступна в отчете.
- Рекрутер быстро видит, что именно кандидат не покрыл.
- Синхронизация с transcript улучшает проверяемость оценки.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test -- checkpoint-panel
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
