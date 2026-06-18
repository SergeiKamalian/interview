# TASK-14.35 — Policy target refusal branch

Status: [x] done

## Prerequisite

- [x] **TASK-14.32** — `EvaluationMode` contract
- [x] **TASK-14.33** — submit passes mode (policy input gets `evaluationMode` or `turn_kind`)
- [x] **TASK-14.34** — scores stable on meta turn (guards не ломают cumulative)

## Контекст

- Баг **DECL-01** — attempt #91 turn 6: `decline_scoped` ✅, но policy → `targetCheckpointKey: fiber_pointers` + topic mismatch redirect
- Doc: `decline_scoped` → missed на targeted only, **не** complete question; pivot на другой CP возможен
- `resolveClarificationFollowUpDecision` — **образец** для новой ветки

## Problem

`evaluateFollowUpPolicy` не имеет `resolveTargetRefusalFollowUpDecision`. После `decline_scoped` / `topic_refusal` срабатывает generic allocator + `detectTopicMismatch` (кандидат упомянул «Fiber» в отказе → false redirect).

## Solution (только этот subtask)

### 1. `resolveTargetRefusalFollowUpDecision`

Вызывается когда `evaluationMode === 'target_refusal'` (или `turn_kind` ∈ {decline_scoped, topic_refusal}).

Логика:

1. **Закрыть probe** на `stickyTargetCheckpointKey` / current target — mark probed/closed в decision reason `candidate_refused_target_checkpoint`
2. **Исключить** этот CP из `allocateFollowUpBudget` candidates (или priority = 0)
3. **Pivot (optional):** если в ответе кандидат предлагает другую тему («lanes», «commit phase») — выбрать следующий eligible CP по keyword/hints mapping (минимально: next highest-priority gap, не тот же CP)
4. `shouldAskFollowUp: true` только если есть другой gap и budget остался
5. **Не** complete main question (в отличие от `decline_whole`)

### 2. Suppress topic mismatch на meta modes

В `detectTopicMismatch` / `resolveTopicRedirectDecision`:

- skip если `evaluationMode` ∈ {clarification, target_refusal, redirect, skip}
- или `turn_kind` ∈ {scope_clarification, format_clarification, decline_scoped, topic_refusal, confused, off_topic}

### 3. Wire

- `follow-up-policy.util.ts` — новая ветка **до** topic redirect и generic allocator
- `follow-up-policy.service.ts` — передать `evaluationMode`
- `follow-up-policy.util.spec.ts` + `follow-up-policy.clarification.spec.ts` pattern — новый `follow-up-policy.target-refusal.spec.ts`

### Regression test (обязательный)

Input как attempt #91 turn 6:

- `candidateTurnKind: decline_scoped`
- `stickyTargetCheckpointKey: fiber_pointers`
- prior states: stack covered, fiber_definition covered
- Expect: `targetCheckpointKey !== fiber_pointers` OR `shouldAskFollowUp: false` with reason `candidate_refused_target_checkpoint` — **не** `topic_mismatch_redirect` на fiber_pointers снова

## Out of scope

- Guards (→ 14.34)
- Golden JSON + CI (→ 14.36)
- ENC-01 mojibake

## Acceptance criteria

- [x] `decline_scoped` не re-probe тот же checkpoint
- [x] Topic mismatch не срабатывает на decline_scoped turn
- [x] `decline_whole` path не затронут
- [x] `scope_clarification` path не затронут (14.27 specs green)
- [x] `pnpm test -- follow-up-policy topic-mismatch` pass
- [x] `pnpm build` pass

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test -- follow-up-policy topic-mismatch
# → 6 suites, 39 passed
pnpm build
# → ok
```

**Ожидал:** после `decline_scoped` policy закрывает probe на refused CP, не делает topic mismatch redirect, pivot на CP из ответа (lanes/commit_phase); `decline_whole` и `scope_clarification` без регрессии.

**Получил:** `resolveTargetRefusalFollowUpDecision` после clarification branch; `isMetaTurnSuppressingTopicMismatch` в topic-mismatch; `evaluationMode` проброшен submit → planner → policy; attempt #91 regression green.

## Changed files

- `utils/follow-up-policy.util.ts`
- `utils/follow-up-policy.target-refusal.spec.ts` (new)
- `utils/topic-mismatch.util.ts`
- `utils/topic-mismatch.util.spec.ts`
- `utils/resolve-evaluation-mode.util.ts`
- `services/follow-up-policy.service.ts`
- `services/follow-up-planner.service.ts`
- `services/adaptive-interview-submit.service.ts`
- `types/follow-up-planner.types.ts`
