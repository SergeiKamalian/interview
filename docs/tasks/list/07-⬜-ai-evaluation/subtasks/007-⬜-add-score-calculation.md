# ⬜ TASK-07.7 — Расчет score по категориям

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать детерминированный scoring engine: агрегация checkpoint/question результатов в итоговый score интервью и category breakdown.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Расчет score по категориям» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/src/modules/scoring/scoring.module.ts`
- `backend/src/modules/scoring/scoring.service.ts`
- `backend/src/modules/scoring/scoring.types.ts`
- `backend/src/modules/scoring/scoring.constants.ts`
- `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts`

## Requirements

1. Категории берутся из question bank (`skill`, `topic`, `difficulty`) и используются как веса.
2. Алгоритм не зависит от wording AI summary, только от структурированных полей и статусов checkpoint.
3. Нормализация score в шкалу 0-100 с округлением до 1 знака.
4. Пороговые рекомендации должны быть конфигурируемы (`SCORE_THRESHOLD_*`).
5. Сервис возвращает explainable breakdown: category -> score -> weight -> contribution.
6. Unit tests покрывают edge cases: пустые ответы, все not_met, mixed statuses.

## Step-by-step Plan

1. Создать scoring constants и формулу агрегации.
2. Собрать mapping checkpoint status -> numeric value.
3. Реализовать category-level aggregation и final normalization.
4. Интегрировать scoring service в final evaluation pipeline.
5. Добавить unit tests для нескольких сценариев оценок.

## Acceptance Criteria

- Итоговый score рассчитывается детерминированно и повторяемо.
- Category breakdown доступен для аналитики блока 07.
- Алгоритм не опирается на неструктурированные галлюцинации модели.

## Checks

```bash
cd backend && npm run test -- scoring
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
