# TASK-09.5 — Добавить compact AI context builder

Status: [x] done

## Goal

Сделать backend builder, который собирает маленький AI context packet для текущего вопроса без полного transcript интервью.

## Context Packet

Должен включать:

- `interviewQuestionId`;
- `attemptId`;
- `questionText`;
- `idealAnswer` или short compressed ideal answer;
- snapshot checkpoints текущего вопроса;
- latest candidate answer;
- current checkpoint states;
- evidence snippets;
- local turns только по текущему `interview_question_id`;
- follow-up limits and counts.

Не должен включать:

- весь transcript attempt;
- ответы по другим main questions;
- dashboard/report data;
- company-wide analytics.

## Scope

- Добавить `AdaptiveInterviewContextService` или аналог.
- Добавить typed context interface.
- Добавить unit tests на размер/состав payload.
- Обновить текущие prompts только в следующих subtasks, не смешивать здесь.

## Requirements

- Context must be deterministic.
- Turns must be sorted by `sequence_order`.
- Limit local turns, например latest 1-3 pairs.
- Evidence snippets должны быть короткими.
- Unknown/large fields должны быть обрезаны safe способом.

## Verification

- Unit test: context for question 1 does not include messages from question 2.
- Unit test: context includes checkpoint states and latest answer.
- Unit test: long answer is bounded or summarized according to implementation policy.
- `pnpm --dir backend run test`.

## Completion Notes

### Context shape

`AdaptiveInterviewContextPacket` in `types/adaptive-interview-context.types.ts`:

- question metadata + `referenceAnswer` (prefers `shortAnswer`, else bounded `idealAnswer`)
- snapshot `checkpoints`
- `latestCandidateAnswer` / `latestCandidateMessageId`
- `checkpointStates`, `evidenceSnippets`
- `localTurns` (latest `ADAPTIVE_LOCAL_TURN_LIMIT * 2` messages for current question only)
- `followUpLimits` (`maxPerQuestion`, `maxPerCheckpoint`, `usedForQuestion`)

### Token-saving guarantees

- Messages filtered by `interviewQuestionId` before building turns
- `boundText()` caps text fields at 500 chars (reference answer up to 600)
- No full attempt transcript loaded into packet
- Deterministic sorting for checkpoints, states, evidence snippets

### Tests

```bash
cd backend && pnpm run test -- adaptive-interview-context   # 2 suites, 5 tests
cd backend && pnpm run test -- build-adaptive-interview-context  # 1 suite, 4 tests
cd backend && pnpm run build  # OK
```

### Added files

- `services/adaptive-interview-context.service.ts`
- `utils/build-adaptive-interview-context.util.ts`
- `config/adaptive-interview-context.config.ts`
- specs for service + util

Prompts not changed (deferred to TASK-09.6).
