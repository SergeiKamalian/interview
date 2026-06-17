# TASK-14.15 — Bank-driven checkpoint guards

## Status

- [x] done (superseded tail work → TASK-14.16)

## Goal

Убрать topic-specific hardcoding из post-guards: опираться на `badAnswerExamples`, `checkpoint.expected` и structured AI rationale вместо regex по `checkpoint_key`.

## Scope

- `bad-answer-signature.util.ts` — overlap с `badAnswerExamples` из question bank
- `apply-checkpoint-score-floors.util.ts` — убрать fiber-specific semantic caps и positive evidence floors
- `false-claim-quote.util.ts` / `checkpoint-red-flags.util.ts` — generic-only
- `VITE_INTERVIEW_AUDIO_ENABLED` — отключение TTS для text-only QA

## Out of scope

- Новые golden cases на другие темы
- Per-checkpoint bad examples в schema

## Verification

- `pnpm test` в backend
- Browser QA: bad / casual strong / formal strong на React Fiber

## Completion Notes

(TBD)
