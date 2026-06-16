# TASK-14.11 — Evaluator vs guard divergence logging

Status: [x] done

## Completion Notes

- Structured `logger.log` event `checkpoint_guard_adjustment` с `promptVersion`, before/after scores
- Тип `CheckpointGuardAdjustment` в `checkpoint-guard-adjustment.types.ts`
- Вызывается из `apply-checkpoint-score-floors.util.ts`

## Goal

Логировать случаи, когда **guards изменили** AI output (score/status cap) — для анализа качества prompt и решения, когда ослаблять guards.

## Проблема сейчас

`applyCheckpointScoreFloors` молча меняет результат. Нет visibility: как часто AI завышает и guards режут.

## Решение

### 1. Divergence event

После guards, если `incoming !== outgoing` for any checkpoint:

```json
{
  "event": "checkpoint_guard_adjustment",
  "attemptId": 34,
  "questionId": "...",
  "checkpointKey": "scheduling",
  "aiStatus": "covered",
  "aiScore": 1.0,
  "guardedStatus": "partial",
  "guardedScore": 0.5,
  "reason": "semantic_contradiction_cap",
  "promptVersion": "2.4.0"
}
```

### 2. Storage

Reuse `ai_usage_logs` metadata JSON **or** new `evaluation_guard_adjustments` table.

Prefer extending usage log metadata first (minimal migration).

### 3. Analytics page (optional slice)

На AiCostAnalyticsPage или новой вкладке: count adjustments per day / per prompt version.

## Files to change

- `apply-checkpoint-score-floors.util.ts` — return adjustment list
- `adaptive-interview-submit.service.ts` — persist log
- `ai-usage-log.service.ts` — metadata shape
- Optional analytics query

## Verification

- Unit: adjustment list populated on Fiber contradiction
- Integration: log row created with metadata

## Acceptance criteria

- [ ] Adjustments logged with before/after
- [ ] reason enum documented
- [ ] Query or export for analysis

## References

- `docs/evaluation-accuracy/README.md` §6 (item O)
