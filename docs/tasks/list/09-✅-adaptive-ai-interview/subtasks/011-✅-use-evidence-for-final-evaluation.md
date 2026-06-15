# TASK-09.11 — Перестроить final evaluation на evidence summaries

Status: [x] done

## Completion Notes

- Final context shape: `buildFinalEvidenceContext()` — compact per-question summaries, `includesFullTranscript: false`
- Score calculation: deterministic from `interview_question_summaries` / checkpoint states; `QuestionSummaryService.buildAndPersist()` on main question complete
- Tests: `build-question-summary.util.spec.ts`, `final-evidence-context.util.spec.ts`; `AdaptiveEvidenceEvaluationService` syncs `question_evaluations` from evidence when `ADAPTIVE_INTERVIEW_ENABLED=true`

## Verification

- `pnpm --dir backend run test` → 24 suites, 58 tests passed
- `pnpm --dir backend run build` → OK
