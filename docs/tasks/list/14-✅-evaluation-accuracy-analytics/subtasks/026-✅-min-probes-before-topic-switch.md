# TASK-14.26 — Min probes before topic switch

Status: [x] done

## Problem (Attempt 82)

Fiber question: **1 follow-up** (scheduling) → сразу topic switch на lazy/Suspense.  
Lazy question получил **5 follow-ups**. Root cause: `sufficient_question_score` (≥85%) останавливал follow-ups, когда `hasProbeRequiredAbovePriority` = false — structural missed checkpoints (`stack_vs_fiber`) имели `probeRequired=true`, но priority < `minPriorityToProbe`.

## Solution

`evaluateFollowUpPolicy`: для блокировки early stop использовать `hasPendingRequiredProbe()` — любой `isProbeRequired || isResidualGapRequired`, **без** фильтра по priority.

## Acceptance criteria

- [x] При score ≥ sufficient ratio и pending probeRequired (даже below minPriority) → follow-up планируется
- [x] Unit tests green
- [x] Live QA: replay attempt-82 Fiber answers → seq 8 = `stack_vs_fiber`, не lazy topic_opener

## Verification

```bash
cd backend && pnpm test -- follow-up-policy follow-up-budget
cd backend && pnpm build
node backend/scripts/replay-attempt82-fiber-qa.mjs
```

## Completion Notes

- `pnpm test -- follow-up-policy follow-up-budget` — 26 passed
- `pnpm build` — OK
- Live QA **attempt 84** (public token interview 12):
  - seq 6: `follow_up_question` / `scheduling`
  - seq 7: scheduling answer
  - seq 8: `follow_up_question` / `stack_vs_fiber` ✅ (attempt 82 было lazy topic_opener)
  - Fiber follow-ups before lazy: **2**
