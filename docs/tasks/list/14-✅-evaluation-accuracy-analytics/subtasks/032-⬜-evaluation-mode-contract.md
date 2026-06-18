# TASK-14.32 — Evaluation mode contract

Status: [ ] todo

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

- [ ] Unit tests: все `turn_kind` из classifier schema → ожидаемый mode
- [ ] Unknown/null → `full` (documented default)
- [ ] `pnpm test -- resolveEvaluationMode evaluation-mode` pass
- [ ] `pnpm build` backend pass
- [ ] Нет изменений в runtime behavior submit (только новые файлы + exports)

## Completion Notes

_(заполнить агентом: команды, expected/got)_

## Changed files (ожидаемо)

- `types/evaluation-mode.type.ts` (new)
- `utils/resolve-evaluation-mode.util.ts` (new)
- `utils/resolve-evaluation-mode.util.spec.ts` (new)
