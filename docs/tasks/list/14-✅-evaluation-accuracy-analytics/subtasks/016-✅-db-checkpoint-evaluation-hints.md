# TASK-14.16 — DB-driven checkpoint evaluation hints

## Status

- [x] done

## Goal

Масштабируемая оценка без topic-specific кода: все сигналы «что верно / что ложно» хранятся в question bank и копируются в interview snapshot.

## Scope

### Schema (migration `016`)

- `question_checkpoints.evaluation_hints` JSON — `mustConcepts`, `falseClaims`, `positiveFloorScore`
- `interview_question_checkpoints.evaluation_hints` JSON — snapshot при создании interview
- `answer_examples.checkpoint_key` NULL — per-checkpoint good/bad examples
- `interview_answer_examples` — snapshot examples при создании interview

### Generic guards (code, один раз)

- `bank-evidence.util.ts` — match hints + examples против cumulative candidate text
- `apply-checkpoint-score-floors.util.ts` — positive floor из bank, false-claim cap из `falseClaims`
- Context packet — per-checkpoint `evaluationHints`, `goodExamples`, `badExamples` из snapshot

### Seed

- `seeds/fiber-evaluation-hints.seed.sql` — React Fiber: hints на 8 checkpoints + per-checkpoint examples + backfill snapshot

## Out of scope

- GraphQL UI для редактирования hints (блок 05)
- Browser QA re-run в этом subtask (нужен restart backend + новый attempt)

## Completion Notes

**Команды:**
- `pnpm migrate` → applied `016_checkpoint_evaluation_hints.sql`
- `docker compose exec mysql mysql ... < seeds/fiber-evaluation-hints.seed.sql`
- `pnpm test` → 151 passed, 1 skipped
- `pnpm build` → OK

**Архитектура:**
```txt
question_checkpoints.evaluation_hints + answer_examples (checkpoint_key)
  → snapshot в interview_question_checkpoints + interview_answer_examples
  → context packet per checkpoint
  → generic bank-evidence guards (floor + false-claim cap)
```

**Проверка БД:** Fiber checkpoints имеют `evaluation_hints`; `interview_answer_examples` backfill для существующих interviews.

**Следующий шаг для QA:** restart `pnpm start:dev`, прогнать 3 профиля в браузере (новый attempt на interview с backfilled snapshot).
