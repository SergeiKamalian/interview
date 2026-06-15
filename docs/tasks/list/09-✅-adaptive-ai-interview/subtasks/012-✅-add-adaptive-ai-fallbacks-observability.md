# TASK-09.12 — Добавить fallback, usage logs и observability

Status: [x] done

## Completion Notes

- Fallback matrix: existing evaluator/planner template fallbacks + `adaptive.error_recovered` socket event; `needs_manual_review` on evaluator failures; follow-up `skipped`/`failed` repo methods
- Logs/usage checks: structured warn logs with `attemptId`, `interviewQuestionId`, `operationType`, `status`; `evaluate_turn` / `plan_follow_up` / `final_summary` via `AiUsageLogService`
- Tests: existing per-turn/planner/submit specs + provider error paths; full `pnpm --dir backend run test` green

## Verification

- `pnpm --dir backend run test` → 58 passed
