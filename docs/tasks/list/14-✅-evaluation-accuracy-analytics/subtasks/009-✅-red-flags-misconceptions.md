# TASK-14.9 — Red flags / misconceptions block

Status: [x] done

## Completion Notes

- `checkpoint-red-flags.util.ts` — извлечение red flags из rationale/guards
- Блок misconceptions в `AdaptiveCheckpointReviewPanel`
- GraphQL attempt 36: red flags на scheduling / fiber_pointers

## Goal

Агрегировать **material false claims** по attempt в отдельный блок «Красные флаги» для HR — быстро видеть опасные заблуждения, не читая все rationale.

## Проблема сейчас

False claims спрятаны в per-checkpoint rationale. HR должен открывать каждую карточку.

## Решение

### 1. Detection sources

- Guards emit `false_claim_cap` events (TASK-14.5)
- Evaluator `depth=false_claim` in rationale (TASK-14.1)
- Parse rationale for false claim patterns

### 2. Storage

**Option A (light):** compute on read from checkpoint states  
**Option B:** `interview_attempt_red_flags` table — если нужна история/filtering

Начать с Option A.

### 3. GraphQL

```graphql
type InterviewRedFlag {
  checkpointKey: String!
  checkpointTitle: String!
  summary: String!
  candidateQuote: String
  severity: String! # low | medium | high
}
```

### 4. UI

Alert section at top of attempt review:

```txt
⚠ Красные флаги (2)
• Scheduling: уверенно утверждал requestIdleCallback как движок Fiber
• Fiber storage: «Fiber хранится в Virtual DOM»
```

## Files to change

- Backend aggregator service
- GraphQL type + resolver
- Frontend RedFlagsPanel component

## Verification

- Fiber 50/50 attempt → ≥2 red flags
- Strong attempt → 0 red flags

## Acceptance criteria

- [ ] Red flags aggregated API
- [ ] UI panel on interview details
- [ ] Severity heuristic documented

## References

- `docs/evaluation-accuracy/README.md` §5.2, §5.5 (item K)
