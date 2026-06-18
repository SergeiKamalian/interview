# TASK-14.28 — Candidate turn AI classifier

Status: [ ] todo

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

- [ ] `CandidateTurnClassifierService` + prompt `candidate_turn_classifier` v1.0.0
- [ ] Types: `CandidateTurnKind`, `CandidateTurnClassification`
- [ ] Joi schema + validator
- [ ] `mapTurnKindToDisposition()` util
- [ ] Golden cases: `calibration/golden-cases/candidate-turn-classifier.json` (30+)
- [ ] `golden-calibration.spec.ts` — suite для classifier
- [ ] Shadow mode: лог classifier vs legacy regex (без смены policy yet)

## Out of scope (14.29+)

- Удаление regex из submit/policy hot path
- Deprecate `legacy-contradiction-cap`
- Frontend changes

## Acceptance criteria

- [ ] Classifier возвращает valid JSON для всех golden cases
- [ ] Golden CI green
- [ ] Маппинг turn_kind → disposition покрыт unit-тестами
- [ ] `pnpm test` + `pnpm build` backend OK
- [ ] Design doc §12 criteria met

## Completion Notes

_(заполнить после реализации)_

## Changed files

_(заполнить после реализации)_
