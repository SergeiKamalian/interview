# ✅ TASK-07.5 — Хранение результата по checkpoint

Status: [x] done

## Completion Notes

**Сделано:**

- DDL из `007_create_ai_evaluation.sql` (`checkpoint_key`, `matched`, `score_awarded`, `evidence_quote`).
- `CheckpointResultRepository.replaceByQuestionEvaluationId` — batch replace, idempotent re-run.
- `mapCheckpointResultsForStorage` — map AI statuses → DB rows.
- GraphQL `CheckpointResultType`, nested в `QuestionEvaluationType`.
- Интеграция в `AiEvaluationService.evaluateAndPersistQuestionAnswer`.

**Проверки:** `npm run test -- checkpoint-result` · `npm run build` · OK
