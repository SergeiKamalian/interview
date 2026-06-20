# TASK-16.8 — Backend: tone preset в промпты

Status: [x] done

## Goal

Сделать тон интервьюера (friendly/neutral/strict) управляемым из настроек интервью.

## Depends on

- TASK-16.7.

## Context

- Сейчас тон захардкожен «friendly professional»:
  - `backend/src/modules/adaptive-interview/prompts/interviewer-voice.prompt.ts`
  - `prompts/follow-up-planner.prompt.ts` (`INTERVIEWER_PERSONA`)
  - `prompts/main-question-opener.prompt.ts`, `prompts/main-question-reveal.prompt.ts`
- `interviewer_name` доходит только до welcome/TTS (`interview-core/utils/interview-welcome.util.ts`), не в диалоговые промпты.

## Scope

- Маппинг `aiTone` → persona-блок (3 варианта) в перечисленных candidate-facing промптах.
- Опционально: пробросить `interviewer_name` в opener/follow-up промпты.
- ВАЖНО: тон НЕ влияет на evaluator/scoring (см. 16.10) — только на формулировки интервьюера.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Smoke: при `strict` формулировки заметно строже, при `friendly` — теплее (сравнить сгенерированные follow-up/opener на одинаковом входе).

## Completion Notes

**Сделано:**
- `prompts/interviewer-voice.prompt.ts`: добавлены пресеты тона — `INTERVIEWER_PERSONA_OPENERS` (3 варианта persona-строки, каждая содержит «human technical interviewer») и `INTERVIEWER_TONE_PRESETS` (friendly/neutral/strict). Экспортированы хелперы `buildInterviewerPersonaOpener(aiTone)` и `buildInterviewerToneBlock(aiTone)`. В tone-блоке зафиксирован инвариант: «Tone changes ONLY how you phrase things to the candidate; it NEVER changes scoring, checkpoints, max score, or which follow-ups are required».
- `prompts/follow-up-planner.prompt.ts`: захардкоженный `INTERVIEWER_PERSONA` const → функция `buildInterviewerPersona(aiTone)` (persona opener + tone-блок). `buildFollowUpPlannerSystemPrompt(aiTone)` и `buildFollowUpPlannerStreamingSystemPrompt(aiTone)` принимают тон (default `DEFAULT_AI_TONE`). Bump version `2.10.0 → 2.11.0`.
- `prompts/main-question-opener.prompt.ts` + `main-question-reveal.prompt.ts`: `buildMainQuestion*SystemPrompt(aiTone)` вставляют tone-блок. Версии bump (opener `1.1.0→1.2.0`, reveal `1.0.0→1.1.0`).
- `services/follow-up-planner.service.ts`: тон берётся из packet (`context.aiTone`, проброшен в 16.7) и передаётся в system/streaming-system промпты.
- `services/main-question-opener.service.ts`: оба метода (`generateTopicOpener`, `generateQuestionInvite`) принимают опц. `aiTone` и передают в system-промпт (default neutral).
- `services/adaptive-interview-submit.service.ts`: приватный `resolveAiTone(interviewId)` через `InterviewCoreRepository.findById` (config-колонки из migration 020); тон резолвится по `question.interviewId` и прокидывается в opener/reveal.
- Spec: `follow-up-planner.prompt.spec.ts` — добавлены тесты (strict содержит «STRICT»/«demanding», friendly «FRIENDLY»/«warm and encouraging», все варианты содержат «NEVER changes scoring» и «human technical interviewer», strict ≠ friendly, default = neutral). `adaptive-interview-submit.service.spec.ts` — в мок репозитория добавлен `findById: jest.fn().mockResolvedValue(null)`.

**Инвариант (соблюдён):** тон применяется ТОЛЬКО к candidate-facing промптам (follow-up planner persona, opener, reveal). Evaluator/scoring (`per-turn-checkpoint-evaluation.prompt.ts`, guards) не затронуты. Combined-turn follow-up в `adaptive-ai-conversation.prompt.ts` намеренно вне scope (там follow_up_question использует shared `INTERVIEWER_FIRST_PERSON_VOICE_RULES`, а основная нагрузка промпта — evaluator; чтобы не менять evaluator-путь, тон туда не вшивался) — отмечено как возможное расширение.

**Верификация:**
- `pnpm -C backend run build` → OK (дважды, в т.ч. после version bump).
- Targeted eslint на изменённые prompt/opener-service/spec файлы → clean (после `prettier --write`). В `follow-up-planner.service.ts` остаются ТОЛЬКО pre-existing prettier/unused-import замечания не на моих строках (мой diff — 4 строки, clean).
- Unit: `npx jest follow-up-planner.prompt main-question-opener.prompt main-question-reveal.prompt adaptive-interview-submit.service follow-up-planner.service` → 5 suites / 26 tests passed.
- Smoke (node на dist): `buildFollowUpPlannerSystemPrompt('strict')` vs `('friendly')` — ожидал заметно более строгую формулировку у strict и тёплую у friendly при одинаковом входе. Получено: strict = «demanding… press for precision… do not over-praise»; friendly = «warm and encouraging… reassure… soften corrections»; оба содержат инвариант про scoring; `differ: true`.
