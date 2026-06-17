# TASK-14.22 — Residual gap probe (narrowing follow-up)

## Status

- [x] done

## Контекст

14.18 закрыл кейс «shallow ответ **до** первого follow-up на advanced checkpoint».

**Не закрыт:** compound follow-up («render phase **и** WIP tree»), кандидат ответил только на **часть** mustConcepts → система закрывала checkpoint после `followUpCount=1`.

**Ожидание:** «Ок, про render верно. А **WIP tree** — что добавите?»

## Goal

1. `residualGapProbeRequired()` — partial coverage после первого follow-up
2. +1 follow-up slot на checkpoint (`RESIDUAL_GAP_PROBE_EXTRA_BUDGET`)
3. Template: «Ок, это верно. А [missing] — что сможете добавить?»
4. Cumulative evidence per checkpoint в follow-up policy

## Completion Notes

**Verification:**

```bash
cd backend
pnpm test -- residual-gap probe-policy follow-up-policy
pnpm test
pnpm build
```

**Expected:** residual follow-up when followUpCount=1 and partial mustConcept coverage; probe status stays `open`.

**Result:** 185 passed, 1 skipped; build OK.

**Implemented:**

- `residualGapProbeRequired()`, `hasPartialConceptCoverage()`, `isWithinCheckpointFollowUpBudget()`
- `buildResidualGapFollowUpQuestion()`, `followUpKind: residual_probe`
- Per-checkpoint evidence in `FollowUpPolicyService`
- `hasPendingProbe()` = advanced + residual pending
- Tests: `follow-up-policy.residual.spec.ts`, extended `probe-policy.util.spec.ts`
