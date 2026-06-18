# TASK-14.33 — Submit evaluation mode routing

Status: [x] done

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

- [x] `decline_scoped` turn: нет OpenAI `evaluate_turn` с 8 checkpoint keys (или narrow scope в логе)
- [x] `substantive_answer`: поведение без регрессии (existing specs green)
- [x] `scope_clarification`: target checkpoint обрабатывается, non-target = priorState в persist
- [x] `pnpm test -- adaptive-interview-submit per-turn-checkpoint-evaluator` pass
- [x] `pnpm build` pass

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test -- adaptive-interview-submit per-turn-checkpoint-evaluator resolve-evaluation-mode
# → 3 suites, 40 passed
pnpm build
# → ok
```

**Ожидал:** после classify — `resolveEvaluationMode` + debug log; meta-turn'ы (`target_refusal`, `clarification`, `redirect`) без full LLM evaluate; persist только target checkpoint; `skip` через существующий decline_whole path; `substantive_answer` без регрессии.

**Получил:** submit пробрасывает `evaluationMode` + `evidenceSource: meta_turn`; evaluator `evaluateMetaTurn()` строит deterministic results через `buildMetaTurnEvaluation` (refusal cap через floors на target-only seed); non-target checkpoint'ы не попадают в `applyTurnEvaluationResults`.

## Changed files

- `services/adaptive-interview-submit.service.ts`
- `services/adaptive-interview-submit.service.spec.ts`
- `services/per-turn-checkpoint-evaluator.service.ts`
- `services/per-turn-checkpoint-evaluator.service.spec.ts`
- `utils/build-meta-turn-checkpoint-evaluation.util.ts` (new)
- `types/evaluation-evidence-source.type.ts` — добавлен `meta_turn`
