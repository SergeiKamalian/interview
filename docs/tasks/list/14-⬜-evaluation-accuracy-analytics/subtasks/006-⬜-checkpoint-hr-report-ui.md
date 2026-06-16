# TASK-14.6 — Per-checkpoint HR report (dashboard)

Status: [ ] todo

## Goal

На странице interview attempt HR видит **структурированный отчёт по каждому checkpoint**: статус, score, rationale, evidence — не только итоговый `/10`.

## Проблема сейчас

Dashboard (`/dashboard/interviews/{id}?attemptId=`) показывает messages и aggregate score. Checkpoint-level rationale из `interview_checkpoint_states` не представлен удобно для HR.

## Решение

### 1. GraphQL

Расширить query attempt details:

```graphql
type InterviewCheckpointState {
  checkpointKey: String!
  title: String!
  status: String!
  scoreAwarded: Float!
  maxScore: Float!
  rationale: String
  evidenceSummary: String
  confidence: Float
  needsManualReview: Boolean
}
```

Проверить что уже есть в schema — дополнить resolver если нужно.

### 2. UI component

`CheckpointEvaluationCard` в `frontend/src/features/` или `widgets/`:

- Progress bar score/max
- Status badge (covered/partial/missed/unclear)
- Expandable rationale + evidence
- Link to related messages (optional)

### 3. Layout

На Interview Details page — секция «Оценка по критериям» под score summary, grouped by question.

## Files to change

- `backend/src/modules/interview-core/` or analytics resolvers
- `frontend/src/pages/dashboard/` interview details
- `frontend/src/shared/api/graphql/operations/` — new/extended query
- Regenerate GraphQL types

## Requirements

- Read-only для HR viewer role.
- Mobile-friendly cards.
- Не показывать internal AI prompt keys.

## Verification

- GraphQL playground: query returns checkpoint states for attempt 34
- Browser: cards render with rationale
- `pnpm --dir frontend run build`

## Acceptance criteria

- [ ] GraphQL exposes per-checkpoint states with rationale
- [ ] UI cards per question/checkpoint
- [ ] Works for completed attempts

## References

- `docs/evaluation-accuracy/README.md` §5.5
- Block 08 dashboard patterns
