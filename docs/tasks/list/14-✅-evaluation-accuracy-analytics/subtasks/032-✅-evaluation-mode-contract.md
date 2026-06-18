# TASK-14.32 — Evaluation mode contract

Status: [x] done

## Контекст (прочитать перед работой)

- [`docs/evaluation-accuracy/candidate-turn-classifier.md`](../../../../evaluation-accuracy/candidate-turn-classifier.md) — §14 Wave 4
- [`docs/evaluation-accuracy/README.md`](../../../../evaluation-accuracy/README.md) — §16 баги GUARD-02, DECL-01 (attempt #91)
- Classifier **уже работает** (v1.1.0) — этот subtask **не трогает** classifier prompt

## Problem

`turn_kind` от classifier не задаёт **глубину** downstream pipeline. Meta-turn'ы (`decline_scoped`, `scope_clarification`) проходят тот же full evaluate + full guards, что и `substantive_answer`.

## Solution (только этот subtask)

Ввести явный контракт `EvaluationMode` и чистую функцию `resolveEvaluationMode(turnKind)`.

### Deliverables

1. **Type** `EvaluationMode` в `types/evaluation-mode.type.ts`:

   ```txt
   full | clarification | target_refusal | redirect | skip
   ```

2. **Resolver** `resolveEvaluationMode.ts` (+ `.spec.ts`) — таблица из classifier doc §14.1:

   | turn_kind | mode |
   |-----------|------|
   | substantive_answer | full |
   | scope_clarification, format_clarification | clarification |
   | decline_scoped, topic_refusal | target_refusal |
   | confused, off_topic | redirect |
   | decline_whole | skip |
   | null / unknown | full (safe default + log warn в caller позже) |

3. **Helpers** (в том же util или рядом):

   - `isMetaTurnMode(mode)` → mode !== 'full'
   - `shouldSkipEvaluation(mode)` → mode === 'skip'
   - `allowsFullCheckpointScoring(mode)` → mode === 'full'

4. **Export** из модуля (index или прямой import — как принято в adaptive-interview).

## Out of scope (не делать в 14.32)

- Wire в submit service (→ 14.33)
- Изменения guards/merge (→ 14.34)
- Изменения policy (→ 14.35)
- Golden case attempt #91 (→ 14.36)

## Acceptance criteria

- [x] Unit tests: все `turn_kind` из classifier schema → ожидаемый mode
- [x] Unknown/null → `full` (documented default)
- [x] `pnpm test -- resolveEvaluationMode evaluation-mode` pass
- [x] `pnpm build` backend pass
- [x] Нет изменений в runtime behavior submit (только новые файлы + exports)

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test -- resolveEvaluationMode evaluation-mode
# → 1 suite, 26 passed
pnpm build
# → ok
```

**Ожидал:** type `EvaluationMode`, resolver по таблице §14.1, helpers, unit tests на все 8 `turn_kind` + null/undefined/unknown → `full`; submit/guards/policy без изменений.

**Получил:** три новых файла в `adaptive-interview`; 26 тестов green; build ok; runtime behavior не изменён.

## Changed files

- `backend/src/modules/adaptive-interview/types/evaluation-mode.type.ts` (new)
- `backend/src/modules/adaptive-interview/utils/resolve-evaluation-mode.util.ts` (new)
- `backend/src/modules/adaptive-interview/utils/resolve-evaluation-mode.util.spec.ts` (new)
