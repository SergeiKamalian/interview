# TASK-14.24 — Probe missed structural checkpoints

Status: [x] done

## Problem (Attempt 82)

`stack_vs_fiber` и `fiber_pointers` → `missed`, `follow_up_count = 0`.  
Shallow accept (`core_plus`) + низкий probe priority — интервьюер не спрашивал.

## Solution

Bank hints (`fiber-evaluation-hints.seed.sql` + fixture):

- `stack_vs_fiber`: `complexityTier: intermediate` (was `core_plus`) + `probeConceptGroups`
- `fiber_pointers`: `complexityTier: intermediate` + `probePolicy` + `probeConceptGroups`

Seed backfill'ит `interview_question_checkpoints`.

## Acceptance criteria

- [x] `probeRequired` true для missed `stack_vs_fiber` / `fiber_pointers` без evidence
- [x] После scheduling probe → next target `stack_vs_fiber`
- [x] Unit tests green
- [x] Live QA attempt 83: follow-up #2 `target_checkpoint_key=stack_vs_fiber`

## Verification

```bash
cd backend && pnpm test -- probe-policy follow-up-policy follow-up-budget
cd backend && pnpm build
docker exec -i ai-interviewer-local-mysql-1 mysql -uai_interviewer -pchangeme ai_interviewer < backend/seeds/fiber-evaluation-hints.seed.sql
```

Browser QA (attempt 83, interview 12):

1. Public link → те же ответы что attempt 82 (topic opener + main fiber + scheduling)
2. DB: `interview_messages` seq 8 → `follow_up_question` / `stack_vs_fiber`

## Completion Notes

- Команды: `pnpm test -- probe-policy follow-up-policy follow-up-budget` — 36 passed; `pnpm build` — OK
- Seed applied to local MySQL; tiers `intermediate` on snapshot iq=15
- Live replay attempt 83: after scheduling answer, message #8 targets `stack_vs_fiber` (was lazy transition on attempt 82)
- Golden case: `react-fiber-attempt82-structural-probe-after-scheduling.json`
