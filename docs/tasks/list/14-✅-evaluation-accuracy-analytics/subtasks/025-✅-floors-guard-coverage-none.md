# TASK-14.25 — Floors guard when coverage=none

Status: [x] done

## Problem (Attempt 82)

`lanes_priority` — AI: `coverage=none`, score 0, но guard поднимал до 0.85 через positive/transitive floor: слово «приоритет» из scheduling follow-up попадало в чужой checkpoint.

## Solution

1. **`applyPositiveEvidenceFloor`** — для non-targeted checkpoint evidence только из `checkpointEvidenceText` (не `latestTurnText` чужого follow-up); skip при `coverage=none`; refusal check на реальном latest answer.
2. **`applyEdgeFloor` / transitive** — `targetEligibleForTransitiveFloor`: не поднимать floor если `coverage=none` и нет direct evidence в checkpoint text.
3. **`hasDirectCheckpointEvidence`** helper в `hint-driven-evidence.util.ts`.

## Acceptance criteria

- [x] Attempt-82-like: scheduling follow-up с «приоритет», lanes `coverage=none` → score остаётся 0
- [x] Existing transitive scheduling→lanes (coverage=low) golden/unit still passes
- [x] Refusal cap test still passes
- [x] Unit tests green

## Verification

```bash
cd backend && pnpm test -- transitive apply-checkpoint-score-floors
cd backend && pnpm build
docker exec -i ai-interviewer-local-mysql-1 mysql -uai_interviewer -pchangeme ai_interviewer < backend/seeds/fiber-evaluation-hints.seed.sql
```

## Completion Notes

- Seed applied: `stack_vs_fiber`/`fiber_pointers` = `intermediate`, `scheduling` = `advanced` on iq=15
- `pnpm test -- transitive apply-checkpoint-score-floors` — 26 passed (golden-calibration has 2 pre-existing band failures on branch unrelated to 14.25)
- `pnpm build` — OK
