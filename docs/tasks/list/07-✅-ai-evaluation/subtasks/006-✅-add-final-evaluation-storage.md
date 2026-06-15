# ✅ TASK-07.6 — Хранение финальной оценки интервью

Status: [x] done

## Completion Notes

**Сделано:**

- `FinalEvaluationRepository.upsertByAttemptId` (UNIQUE `interview_attempt_id`).
- `FinalEvaluationService` — deterministic score via `ScoringService` + OpenAI narrative JSON.
- Prompt `final_evaluation` v1.0.0, validate через `AiResponseValidatorService`.
- GraphQL: `finalEvaluationByAttempt`, mutation `evaluateInterviewAttempt`.

**Проверки:** `npm run test` · `npm run build` · OK
