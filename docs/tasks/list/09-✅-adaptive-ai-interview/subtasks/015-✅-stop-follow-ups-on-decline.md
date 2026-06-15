# TASK-09.15 — Остановить follow-ups при «не знаю»

Status: [x] done

## Goal

Если кандидат явно отказывается отвечать («ничего не знаю по useEffect» и т.п.), система не должна задавать follow-up по тому же вопросу.

## Changes

- `isCandidateDecliningKnowledge()` — детектор RU/EN фраз отказа.
- Policy: `candidate_declined_knowledge` → `shouldAskFollowUp=false`.
- Submit flow: при decline — skip `evaluate_turn` и `plan_follow_up`, mark checkpoints `skipped`, переход к следующему main question.
- `CheckpointStateRepository.skipCheckpointsOnCandidateDecline()`.

## Completion Notes

- Unit tests: `candidate-decline.util.spec.ts`, `follow-up-policy.util.spec.ts`, `adaptive-interview-submit.service.spec.ts`.
- Smoke: ответ «Я ничего не знаю по useEffect» → сразу следующий вопрос, без follow-up.
