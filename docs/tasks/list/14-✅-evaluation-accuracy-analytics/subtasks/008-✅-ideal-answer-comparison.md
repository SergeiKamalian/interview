# TASK-14.8 — Ideal answer comparison в отчёте

Status: [x] done

## Completion Notes

- Collapsible «Эталонный ответ» per checkpoint в `AdaptiveCheckpointReviewPanel`
- `idealAnswer` из question bank snapshot в review service

## Goal

HR может сравнить ответ кандидата (evidence snippets) с **ideal_answer** из question bank snapshot — без ручного поиска в админке.

## Проблема сейчас

`ideal_answer` есть в snapshot, но не показывается на attempt review page.

## Решение

### 1. GraphQL

Include per question:

```graphql
type InterviewQuestionReview {
  questionText: String!
  idealAnswer: String
  candidateEvidence: [String!]!
  checkpointStates: [InterviewCheckpointState!]!
}
```

### 2. UI

Collapsible «Эталонный ответ» vs «Ответ кандидата (сводка)»:

- Side-by-side на desktop
- Stacked на mobile
- Highlight optional (future) — не в scope

### 3. Privacy

Ideal answer visible only to company users with interview read permission.

## Files to change

- Backend resolver — join snapshot ideal_answer
- Frontend interview details section

## Verification

- Fiber question shows ITLEAD-based ideal answer
- Evidence snippets from checkpoint states displayed alongside

## Acceptance criteria

- [ ] ideal_answer in GraphQL for attempt review
- [ ] UI collapsible comparison section
- [ ] Permission check

## References

- `docs/evaluation-accuracy/README.md` §5.5 (item J)
- `question-bank.seed.sql` Fiber ideal_answer
