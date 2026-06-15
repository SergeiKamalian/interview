# TASK-09.6 — Добавить per-turn checkpoint evaluator

Status: [x] done

## Goal

Добавить AI evaluation на каждый ответ кандидата внутри текущего вопроса, чтобы обновлять checkpoint states до перехода дальше.

## Scope

- Добавить prompt/schema для per-turn evaluator.
- Использовать compact context из TASK-09.5.
- Валидировать AI response:
  - only known `checkpoint_key`;
  - statuses from allowed enum;
  - score within checkpoint max;
  - confidence 0..1.
- Обновлять `interview_checkpoint_states`.
- Сохранять `evidence_summary`, `evidence_message_ids`, `rationale`, `needs_manual_review`.
- Логировать AI usage.

## Output Contract

AI должен вернуть structured JSON примерно такого смысла:

```json
{
  "checkpoint_results": [
    {
      "checkpoint_key": "dependency_array",
      "status": "missed",
      "score_awarded": 0,
      "confidence": 0.92,
      "evidence_summary": null,
      "rationale": "Candidate did not mention dependency array."
    }
  ]
}
```

## Requirements

- AI не может менять `max_score`.
- AI не может создавать новые checkpoints.
- Invalid response должен пройти repair один раз или помечаться `needs_manual_review`.
- Provider timeout не должен ломать public interview flow.

## Verification

- Unit tests for validator.
- Service test with mocked AI provider.
- Test unknown checkpoint key rejected.
- Test partial/covered/missed updates state correctly.
- `pnpm --dir backend run test`.

## Completion Notes

### Prompt/schema files

- `prompts/per-turn-checkpoint-evaluation.prompt.ts`
- `prompts/per-turn-checkpoint-evaluation-repair.prompt.ts`
- `schemas/per-turn-evaluation.schema.ts`
- `types/per-turn-evaluation.types.ts`

### Validator behavior

`PerTurnEvaluationValidatorService`:
- validates JSON shape (`checkpoint_results`)
- statuses: `covered | partial | missed | unclear`
- rejects unknown/missing/duplicate keys
- rejects `score_awarded > max_score` and `confidence` outside 0..1

### Service

`PerTurnCheckpointEvaluatorService`:
- `evaluateTurn()` — compact context + AI call + one repair + usage log (`evaluate_turn`)
- `evaluateTurnAndPersist()` — ensure states, evaluate, update `interview_checkpoint_states`
- provider errors → `provider_error` + `needs_manual_review` (no throw)
- invalid after repair → `invalid_ai_response` + `needs_manual_review`

`CheckpointStateRepository.applyTurnEvaluationResults()` updates status/score/evidence/rationale/message ids.

Public submit flow wiring deferred to TASK-09.8.

### Tests

```bash
cd backend && pnpm run test -- per-turn
# 2 suites, 7 tests passed

cd backend && pnpm run build
# OK
```
