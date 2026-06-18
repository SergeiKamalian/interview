# TASK-14.34 — Guards + merge mode-aware freeze

Status: [x] done

## Prerequisite

- [x] **TASK-14.32** — `EvaluationMode` contract
- [x] **TASK-14.33** — submit передаёт `evaluationMode` в evaluate/guards path

## Контекст

- Баг **GUARD-02** (`docs/evaluation-accuracy/README.md` §16)
- Attempt #91 turn 6: AI дал `fiber_definition covered 1.0`, guards → `missed 0` (`status_score_alignment`, `bad_example_overlap_cap`)
- Существующий паттерн: `applyScopeClarificationScoreFreeze` — расширить на все meta modes

## Problem

`applyCheckpointScoreFloors` прогоняет **все** checkpoint'ы через `bad_example_overlap_cap`, `enforceStatusScoreAlignment`, merge с `incomingAllowsScoreDecrease` — даже когда latest turn — meta/decline без нового technical evidence.

## Solution (только этот subtask)

### Правило

```txt
if evaluationMode !== 'full' && checkpointKey !== targetCheckpointKey:
  return priorState snapshot (score, status, rationale append meta_turn_frozen tag)
  skip all guards and skip merge decrease

if evaluationMode === 'target_refusal' && checkpointKey === target:
  applyExplicitRefusalCap only (+ shallow accept close if probed)
  skip bad_example_overlap on full cumulative text for non-target semantics

if evaluationMode === 'clarification' && checkpointKey === target:
  extend existing scope freeze (14.27) — freeze prior score
```

### Implementation notes

1. Проброс `evaluationMode` в `applyCheckpointScoreFloors(..., { evaluationMode })`.

2. Центральная функция `shouldFreezeCheckpointOnMetaTurn(mode, checkpointKey, targetKey)`.

3. `mergeCheckpointEvaluation`: при `evidenceSource: meta_turn` — `incomingAllowsScoreDecrease: false` для non-target (belt and suspenders).

4. **Не ломать** `full` mode — все existing specs в `apply-checkpoint-score-floors.util.spec.ts` должны остаться green.

### Regression test (обязательный)

Симулировать attempt #91 turn 6:

- prior: `fiber_definition covered 1.0`, `render_phase partial 0.75`, `stack_vs_fiber covered 1.0`
- incoming turn: `decline_scoped` на `fiber_pointers`, text про «не углублюсь в child/sibling/return»
- after guards: `fiber_definition` **остаётся 1.0**, `render_phase` **≥ prior**, `fiber_pointers` partial/missed с refusal cap

## Out of scope

- Policy re-probe (→ 14.35)
- Submit routing (уже в 14.33)
- Final golden JSON file (→ 14.36)

## Acceptance criteria

- [x] GUARD-02 сценарий в unit test — non-target scores не падают
- [x] `scope_clarification` freeze (14.27) — без регрессии
- [x] `full` substantive path — без регрессии
- [x] `pnpm test -- apply-checkpoint-score-floors merge-checkpoint-evaluation` pass
- [x] `pnpm build` pass

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test -- apply-checkpoint-score-floors merge-checkpoint-evaluation build-meta-turn resolve-evaluation-mode
# → 3 suites, 51 passed
pnpm test -- adaptive-interview-submit per-turn-checkpoint-evaluator
# → 2 suites, 14 passed
pnpm build
# → ok
```

**Ожидал:** на meta-turn non-target checkpoint'ы freeze prior cumulative scores; target_refusal применяет только refusal cap на target; merge не понижает score при `meta_turn` + `lockPriorScore`; attempt #91 turn 6 regression green.

**Получил:** `shouldFreezeCheckpointOnMetaTurn` + `buildMetaTurnFrozenCheckpointResult` в floors; target_refusal — укороченный guard chain; `evaluationMode` проброшен из evaluator и build-meta-turn; merge belt-and-suspenders через `lockPriorScore` и `meta_turn_frozen` rationale tag.

## Changed files

- `utils/apply-checkpoint-score-floors.util.ts`
- `utils/apply-checkpoint-score-floors.util.spec.ts`
- `utils/merge-checkpoint-evaluation.util.ts`
- `utils/merge-checkpoint-evaluation.util.spec.ts`
- `utils/resolve-evaluation-mode.util.ts`
- `utils/resolve-evaluation-mode.util.spec.ts`
- `utils/build-meta-turn-checkpoint-evaluation.util.ts`
- `services/per-turn-checkpoint-evaluator.service.ts`
