# TASK-14.12 — A/B prompt versioning

Status: [ ] todo

## Goal

Безопасно катить новые версии evaluator/follow-up prompts с **version tag** в логах и возможностью сравнить metrics (score distribution, guard adjustments, fallback rate).

## Проблема сейчас

`PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION = '2.4.0'` — константа в коде. Нет feature flag для A/B.

## Решение

### 1. Version in all AI logs

Уже частично: prompt key + version в usage log. Ensure follow-up planner also logs version.

### 2. Optional env override

```txt
PER_TURN_EVAL_PROMPT_VERSION=2.5.0-experimental
```

For internal testing only.

### 3. Analytics breakdown

Group by `prompt_version`:

- avg score per question
- guard adjustment rate
- follow-up fallback rate

### 4. Repair prompt audit (item Q)

Track `follow-up-planner-repair` success rate vs direct LLM success.

## Files to change

- `ai-usage-log.service.ts`
- Analytics GraphQL + `AiCostAnalyticsPage` or new page
- Config schema for optional version override

## Verification

- Two versions in logs distinguishable in SQL query
- Dashboard chart by version (mock data ok)

## Acceptance criteria

- [ ] Version on all adaptive AI calls
- [ ] Analytics breakdown by version
- [ ] Env override documented in `.env.example`

## References

- `docs/evaluation-accuracy/README.md` §6 (items P, Q)
