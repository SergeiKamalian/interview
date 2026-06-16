# TASK-14.14 — Follow-up answer weight < main answer

Status: [ ] todo

## Goal

Evidence с **follow-up** ответов не должно весить столько же, сколько **main_answer** — иначе кандидат на 50/50 добирает score buzzwords на уточняющих вопросах (как в attempt 34).

## Проблема сейчас

Per-turn evaluation cumulative across local turns **без различия источника turn**. Follow-up ответ может поднять checkpoint с 0 → 0.5 → 1.0, даже если main answer был слабым и частично ложным.

## Решение

### Option A — Merge weighting (recommended first)

В `merge-checkpoint-evaluation.util.ts`:

```txt
incoming from follow_up_answer → apply FOLLOW_UP_SCORE_CAP_RATIO (e.g. 0.8) to score delta
incoming from main_answer → full delta
```

### Option B — Separate evidence tiers

Store `main_evidence_score` vs `follow_up_evidence_score` in checkpoint state — heavier schema change.

### Option C — Evaluator instruction

Prompt: «Follow-up answers can only raise score by at most 0.25 per checkpoint unless main answer already demonstrated partial knowledge» — soft, unreliable alone; combine with A.

### Config

```txt
FOLLOW_UP_SCORE_DELTA_CAP=0.25
FOLLOW_UP_MAX_RELATIVE_BOOST=0.5  # follow-up cannot more than double partial main score
```

## Files to change

- `merge-checkpoint-evaluation.util.ts`
- `adaptive-interview-submit.service.ts` — pass message kind to merge
- `merge-checkpoint-evaluation.util.spec.ts`

## Verification

- Scenario: main=0, follow-up buzzword → score ≤ 0.25
- Scenario: main=0.5 partial, follow-up clarifies → can reach 0.75–1.0 with correct content
- Golden case 50/50 total lower

## Acceptance criteria

- [ ] Message kind aware merge
- [ ] Configurable caps
- [ ] Specs for main vs follow-up weighting
- [ ] Documented in evaluation-accuracy README

## References

- `docs/evaluation-accuracy/README.md` §6 (item M)
- Attempt 34: score improved on follow-ups
