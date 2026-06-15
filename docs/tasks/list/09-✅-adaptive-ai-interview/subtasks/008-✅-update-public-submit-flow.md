# TASK-09.8 — Обновить public interview submit flow

Status: [x] done

## Goal

Изменить `submitInterviewAnswer`: после ответа кандидата backend должен уметь вернуть follow-up по текущему вопросу вместо автоматического перехода к следующему main question.

## Current Flow

```txt
candidate answer
→ save message
→ if more questions: append next main question
→ else complete attempt
```

## Target Flow

```txt
candidate answer
→ save message with message_kind
→ evaluate current answer
→ update checkpoint states
→ policy decides:
   - ask follow-up
   - or append next main question
   - or complete attempt
```

## Scope

- Extend `SubmitInterviewAnswerPayload` if needed:
  - `nextMessageKind`;
  - `currentQuestionId`;
  - `targetCheckpointKey` optional;
  - `answeredMainQuestions`;
  - `answeredFollowUps`.
- Save AI follow-up message as `role = ai`, `message_kind = follow_up_question`.
- Save candidate response to follow-up as `message_kind = follow_up_answer`.
- Preserve old behavior when adaptive mode disabled.
- Add feature flag/env if useful: `ADAPTIVE_INTERVIEW_ENABLED=true`.

## Requirements

- Existing public interview frontend must not break.
- Completion still triggers final/attempt evaluation path.
- Empty answers still rejected.
- If AI evaluator/planner fails, system continues safely:
  - either next main question;
  - or mark `needs_manual_review`.
- Progress UI must not count follow-ups as main questions.

## Verification

- GraphQL mutation smoke:
  - answer main question;
  - receive follow-up;
  - answer follow-up;
  - receive next main question.
- Test completion after final question.
- Test adaptive disabled fallback.
- `pnpm --dir backend run test`.
- `pnpm --dir backend run build`.

## Completion Notes

- API changes: `SubmitInterviewAnswerPayload` extended with `pendingMessageText`, `messageKind`, `currentInterviewQuestionId`, `isFollowUp`, `answeredMainQuestions`, `totalMainQuestions`, `currentQuestionFollowUpCount`; legacy fields `nextQuestionText`, `answeredQuestions`, `totalQuestions` preserved. `InterviewMessageType` extended with `messageKind`, `interviewQuestionId`, `targetCheckpointKey`. Feature flag `ADAPTIVE_INTERVIEW_ENABLED` (default `false`).
- Smoke GraphQL requests:
  - Legacy (`ADAPTIVE_INTERVIEW_ENABLED=false`, port 3000): `startPublicInterview` → `submitInterviewAnswer` → `status=in_progress`, `answeredMainQuestions=1`, `isFollowUp=false`, `messageKind=null`
  - Adaptive (`ADAPTIVE_INTERVIEW_ENABLED=true`, port 3001): main answer → `messageKind=follow_up_question`, `isFollowUp=true`; follow-up answer → another follow-up or next main question
- Fallback behavior: evaluator/planner errors mark `needs_manual_review` (existing services) and policy proceeds to next main question or completion; legacy path unchanged when flag off.
- Tests: `pnpm --dir backend run test` → 20 suites, 53 tests passed; `pnpm --dir backend run build` → OK; `adaptive-interview-submit.service.spec.ts` — 4 tests.
