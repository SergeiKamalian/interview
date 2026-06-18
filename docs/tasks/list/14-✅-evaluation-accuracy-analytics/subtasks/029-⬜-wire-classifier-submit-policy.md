# TASK-14.29 — Wire classifier into submit + policy

Status: [ ] todo

## Depends on

TASK-14.28

## Problem

Classifier существует, но policy всё ещё читает regex (`resolveScopeClarificationDisposition`, `isFullQuestionDecline`, `isScopeClarificationTurn`).

## Solution

- `adaptive-interview-submit.service.ts`: `classifyTurn()` перед evaluate; fast-path `decline_whole` через classifier
- `follow-up-policy.util.ts`: `turn_kind` вместо `isScopeClarificationTurn`
- `apply-checkpoint-score-floors.util.ts`: убрать regex disposition override
- `topic-mismatch.util.ts`, `probe-policy.util.ts`: classifier flags

## Acceptance criteria

- [ ] Нет regex override disposition после evaluate
- [ ] Fiber clarification scenario (14.27) проходит без regex
- [ ] `pnpm test` policy + submit specs green
