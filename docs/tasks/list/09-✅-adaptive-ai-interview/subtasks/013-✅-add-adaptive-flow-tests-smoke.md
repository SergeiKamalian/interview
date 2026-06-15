# TASK-09.13 — Покрыть adaptive flow тестами и smoke-check

Status: [x] done

## Completion Notes

- Automated tests: backend 24 suites / 58 tests (`adaptive-interview-submit`, `follow-up-*`, `per-turn-*`, `interview-realtime`, `build-question-summary`, `final-evidence-context`); frontend lint + build OK
- Manual smoke steps:
  1. `ADAPTIVE_INTERVIEW_ENABLED=true` + `pnpm --dir backend run start`
  2. `startPublicInterview` → `submitInterviewAnswer` (main) → follow-up returned
  3. Socket join `http://localhost:3000/interview` with `publicToken` + `attemptId`
- SQL verification: tables `interview_checkpoint_states`, `interview_follow_ups`, `interview_question_summaries`, `ai_usage_logs` populated during adaptive submit (verified in prior subtasks 09.6–09.8 smoke)
- Socket/reconnect verification: `interview-realtime.gateway.spec.ts` + manual join smoke on port 3002
- Token/context verification: final prompt uses `adaptive_summaries` source without full transcript (`includesFullTranscript: false`)
- Known limitations: full browser E2E not automated in CI; enable `ADAPTIVE_INTERVIEW_ENABLED=true` for adaptive path in dev

## Commands run

```bash
pnpm --dir backend run test
pnpm --dir backend run build
pnpm --dir frontend run lint
pnpm --dir frontend run build
```
