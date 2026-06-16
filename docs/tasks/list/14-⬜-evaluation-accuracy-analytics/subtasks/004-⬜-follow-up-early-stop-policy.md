# TASK-14.4 — Follow-up early stop policy

Status: [ ] todo

## Goal

Не задавать 5 follow-ups когда score уже **достаточен** или follow-ups **не улучшают** evidence — особенно на 50/50 ответах, где кандидат добирает buzzwords.

## Проблема сейчас

`follow-up-policy.util.ts` — лимит по count и базовый порог, но:

- partial 0.5 на многих checkpoints всё ещё триггерит follow-up
- нет «stagnation detection» (2 follow-ups без score delta)
- attempt 34: 5 follow-ups при уже завышенном score

## Решение

### 1. Sufficient score stop

```txt
if sum(score_awarded) / sum(max_score) >= SUFFICIENCY_RATIO (0.85)
   AND no checkpoint has status=missed with mention_only depth
→ stop follow-ups, advance to next question
```

### 2. Stagnation stop

```txt
if last 2 follow-ups did not increase sum(score_awarded)
→ stop
```

### 3. Diminishing returns

```txt
if checkpoint status=partial AND score >= 0.5 * max
   AND accuracy already evaluated as partial_knowledge
→ do not follow up this checkpoint again (mark exhausted)
```

### 4. Config

Env or constants in `follow-up-policy.util.ts`:

- `FOLLOW_UP_SUFFICIENCY_RATIO=0.85`
- `FOLLOW_UP_MAX_PER_QUESTION=3` (review current default)
- `FOLLOW_UP_STAGNATION_LIMIT=2`

## Files to change

- `backend/src/modules/adaptive-interview/utils/follow-up-policy.util.ts`
- `backend/src/modules/adaptive-interview/utils/follow-up-policy.util.spec.ts`
- `backend/src/modules/adaptive-interview/services/adaptive-interview-submit.service.ts` (wire stagnation tracking)

## DB consideration

Может понадобиться поле `follow_up_exhausted` per checkpoint state — опционально, можно in-memory per question session сначала.

## Verification

- Unit: 50/50 state → `shouldPlanFollowUp=false` after sufficiency or stagnation.
- Golden case `react-fiber-50-50`: ≤2 follow-ups.
- `pnpm --dir backend run test`.

## Acceptance criteria

- [ ] Sufficiency ratio stop
- [ ] Stagnation stop
- [ ] Specs for edge cases (all missed vs high partial sum)
- [ ] Max follow-ups per question documented

## References

- `docs/evaluation-accuracy/README.md` §5.4
