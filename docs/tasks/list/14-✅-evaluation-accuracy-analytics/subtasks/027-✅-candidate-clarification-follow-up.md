# TASK-14.27 — Candidate clarification on vague follow-up

Status: [x] done

## Problem

После нормального ответа по checkpoint AI задаёт **размытый** follow-up («уточните технические детали»).  
Кандидат отвечает **не по теме, а уточняет scope**: «Что именно вам интересно?» / «Вы про useEffect или useState?».

Система трактовала это как обычный (слабый) ответ → закрывала Fiber / переключала main question (lazy topic_opener).

## Solution

- Disposition `asked_for_scope` (regex + AI prompt)
- Follow-up policy: `clarification_redirect` на том же checkpoint, max 2 scope-turns → `scope_clarification_exhausted`
- Score freeze на targeted checkpoint при meta-turn (не растёт балл)
- `buildProbeFollowUpQuestion` fallback на `missingMustConcepts` вместо generic «технические детали»
- Prompts 2.8.0 (evaluator) / 2.9.0 (planner) + interviewer voice rules

## Acceptance criteria

- [x] Meta-ответ «Что именно вам интересно?» после vague probe → **не** lazy topic_opener
- [x] AI follow-up с конкретикой (mustConcepts) или явное «имел в виду X, не Y»
- [x] Не decline, score checkpoint не растёт от meta-turn
- [x] После 2 clarification без содержательного ответа → `scope_clarification_exhausted` + complete question
- [x] Unit tests + build

## Completion Notes

**Commands run:**

```bash
cd backend && pnpm test -- candidate-clarification follow-up-policy.clarification apply-checkpoint-score-floors per-turn-checkpoint-evaluation.prompt
cd backend && pnpm build
```

**Expected:** 30 tests pass; nest build succeeds.

**Got:** 4 suites / 30 tests passed; build OK.

**Live QA:** не запускался — backend в терминале с `MODULE_NOT_FOUND` на `dist/main.js`; поведение покрыто unit-тестами policy + score freeze + template clarification.

## Changed files

- `utils/candidate-clarification.util.ts` (+ spec)
- `utils/follow-up-policy.util.ts` (+ `follow-up-policy.clarification.spec.ts`)
- `utils/apply-checkpoint-score-floors.util.ts` (+ spec case)
- `utils/probe-policy.util.ts` — mustConcepts fallback
- `types/candidate-answer-disposition.type.ts`, `schemas/per-turn-evaluation.schema.ts`
- `utils/candidate-decline.util.ts`
- `services/adaptive-interview-submit.service.ts`
- `services/follow-up-policy.service.ts`
- `prompts/per-turn-checkpoint-evaluation.prompt.ts` (2.8.0)
- `prompts/follow-up-planner.prompt.ts` (2.9.0)
- `prompts/interviewer-voice.prompt.ts`
