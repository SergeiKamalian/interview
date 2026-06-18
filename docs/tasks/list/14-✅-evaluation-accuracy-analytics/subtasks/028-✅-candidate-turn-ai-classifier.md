# TASK-14.28 — Candidate turn AI classifier

Status: [x] done

## Problem

Intent кандидата (вопрос vs ответ vs отказ) определяется через **~90 hardcoded regex** в `candidate-clarification`, `candidate-decline`, `topic-opener` и др. Regex перебивает AI disposition, даёт false positive/negative, не масштабируется.

Полный design: [`docs/evaluation-accuracy/candidate-turn-classifier.md`](../../../../evaluation-accuracy/candidate-turn-classifier.md)

## Solution

Ввести **`CandidateTurnClassifier`** — маленький LLM-вызов на каждый ответ кандидата:

```json
{
  "turn_kind": "substantive_answer | scope_clarification | format_clarification | decline_whole | decline_scoped | topic_refusal | confused | off_topic",
  "confidence": "high | low",
  "reason": "one sentence"
}
```

Prompt включает **подробные правила** для каждого `turn_kind` (см. design doc §3).

## Scope (этот subtask)

- [x] `CandidateTurnClassifierService` + prompt `candidate_turn_classifier` v1.0.0
- [x] Types: `CandidateTurnKind`, `CandidateTurnClassification`
- [x] Joi schema + validator
- [x] `mapTurnKindToDisposition()` util
- [x] Golden cases: `calibration/golden-cases/candidate-turn-classifier.json` (33)
- [x] `candidate-turn-classifier.spec.ts` — suite для classifier
- [x] Shadow mode: `inferLegacyTurnKindShadow` + `classify_turn.shadow` log

## Out of scope (14.29+)

- Удаление regex из submit/policy hot path
- Deprecate `legacy-contradiction-cap`
- Frontend changes

## Acceptance criteria

- [x] Classifier возвращает valid JSON для всех golden cases (mapping/disposition offline; live AI optional)
- [x] Golden CI green
- [x] Маппинг turn_kind → disposition покрыт unit-тестами
- [x] `pnpm test` + `pnpm build` backend OK
- [x] Design doc §12 criteria met

## Completion Notes

**Commands run:**

```bash
cd backend && pnpm test -- candidate-turn-classifier map-turn-kind-to-disposition
cd backend && pnpm build
```

**Expected:** 51 tests pass (4 suites); nest build succeeds.

**Got:** 4 suites / 51 tests passed; build OK.

**Live AI:** не запускался — offline golden + validator + shadow divergence tests.

## Changed files

- `types/candidate-turn-classifier.types.ts`
- `schemas/candidate-turn-classifier.schema.ts`
- `prompts/candidate-turn-classifier.prompt.ts` (+ spec)
- `services/candidate-turn-classifier.service.ts`
- `services/candidate-turn-classifier-validator.service.ts` (+ spec)
- `utils/map-turn-kind-to-disposition.util.ts` (+ spec)
- `utils/legacy-turn-kind-shadow.util.ts`
- `calibration/golden-cases/candidate-turn-classifier.json`
- `calibration/candidate-turn-classifier.spec.ts`
- `adaptive-interview.module.ts`
