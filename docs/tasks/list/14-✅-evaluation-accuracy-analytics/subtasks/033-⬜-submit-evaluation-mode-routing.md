# TASK-14.33 — Submit evaluation mode routing

Status: [ ] todo

## Prerequisite

- [x] **TASK-14.32** — `EvaluationMode` + `resolveEvaluationMode` существуют

## Контекст

- [`candidate-turn-classifier.md`](../../../../evaluation-accuracy/candidate-turn-classifier.md) §14.2
- `adaptive-interview-submit.service.ts` — уже есть fast path для `decline_whole` (skip evaluate)

## Problem

После classify все non-decline_whole turn'ы идут в `evaluateTurnAndPersist` с полным checkpoint set — даже `decline_scoped` и `scope_clarification`.

## Solution (только этот subtask)

После `classifyTurn()` вычислить `evaluationMode` и **маршрутизировать** submit:

### Routing table

| mode | Действие |
|------|----------|
| `skip` | Существующий path `decline_whole` (не дублировать логику) |
| `target_refusal` | **Не вызывать full LLM evaluate.** Deterministic update target checkpoint: `applyExplicitRefusalCap` / shallow accept close + persist states |
| `clarification` | Evaluate **только target checkpoint** ИЛИ skip LLM + freeze prior (выбрать минимальный путь; предпочтение: target-only evaluate если уже есть hook в evaluator) |
| `redirect` | Target-only light evaluate или skip + disposition persist |
| `full` | Текущий `evaluateTurnAndPersist` без изменений |

### Требования

1. Пробросить `evaluationMode` в:
   - `perTurnCheckpointEvaluatorService.evaluateTurnAndPersist({ evaluationMode })`
   - debug log: `submit_answer.evaluation_mode`

2. Evaluator: при `target_refusal` / `clarification` / `redirect` — **не запрашивать** full JSON по всем checkpoint'ам (narrow prompt или post-filter + priorState passthrough для non-target).

3. `evidenceSource`: добавить значение `meta_turn` в `EvaluationEvidenceSource` если нужно для merge (согласовать с 14.34).

4. Unit tests в `adaptive-interview-submit.service.spec.ts` — минимум:
   - `decline_scoped` → evaluate не вызывает full 8-checkpoint path (mock)
   - `substantive_answer` → full path как раньше

## Out of scope

- Guards freeze non-target (→ 14.34) — но evaluator **не должен** портить non-target scores даже до guards
- Policy branches (→ 14.35)
- Golden calibration (→ 14.36)

## Acceptance criteria

- [ ] `decline_scoped` turn: нет OpenAI `evaluate_turn` с 8 checkpoint keys (или narrow scope в логе)
- [ ] `substantive_answer`: поведение без регрессии (existing specs green)
- [ ] `scope_clarification`: target checkpoint обрабатывается, non-target = priorState в persist
- [ ] `pnpm test -- adaptive-interview-submit per-turn-checkpoint-evaluator` pass
- [ ] `pnpm build` pass

## Completion Notes

_(заполнить агентом)_

## Changed files (ожидаемо)

- `services/adaptive-interview-submit.service.ts`
- `services/adaptive-interview-submit.service.spec.ts`
- `services/per-turn-checkpoint-evaluator.service.ts` (narrow scope)
- `types/evaluation-evidence-source.type.ts` (если добавлен `meta_turn`)
