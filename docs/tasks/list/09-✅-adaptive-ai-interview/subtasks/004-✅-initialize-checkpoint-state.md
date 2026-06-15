# TASK-09.4 — Инициализировать checkpoint state

Status: [x] done

## Goal

При прохождении интервью создавать `interview_checkpoint_states` для текущего question/attempt на основе snapshot checkpoints.

## Scope

- Добавить repository/service для adaptive state.
- При старте вопроса или первом ответе создать states:
  - `status = unseen`;
  - `score_awarded = 0`;
  - `max_score = snapshot checkpoint score`;
  - `follow_up_count = 0`.
- Сделать operation idempotent.
- Не создавать states для questions, которые ещё не дошли до кандидата, если это усложняет flow.

## Requirements

- Source checkpoints: `interview_question_checkpoints`.
- Unique key должен предотвращать дубли.
- При повторном submit/refresh состояние не должно сбрасываться.
- State должен быть scoped by `company_id`, `interview_attempt_id`, `interview_question_id`.

## Suggested Files

- `backend/src/modules/interview-core/interview-core.repository.ts`
- `backend/src/modules/ai-evaluation/` или новый `backend/src/modules/adaptive-interview/`
- specs рядом с новым service/repository.

## Verification

- Unit test: first answer creates states for all checkpoints.
- Unit test: repeated init does not duplicate rows.
- SQL check after sample attempt: count states equals count snapshot checkpoints.
- `pnpm --dir backend run test`.
- `pnpm --dir backend run build`.

## Completion Notes

### Added services/repositories

- `backend/src/modules/adaptive-interview/` — новый модуль
  - `CheckpointStateRepository` — idempotent `INSERT ... ON DUPLICATE KEY UPDATE id = id`
  - `CheckpointStateService` — загрузка snapshot checkpoints + ensure states
- Hook в `InterviewPublicService`:
  - `startPublicInterview` — init для первого вопроса при создании attempt
  - `submitAnswer` — ensure перед сохранением ответа (только текущий question)

### Tests

```bash
cd backend && pnpm run test -- checkpoint-state
# 2 suites, 4 tests passed

cd backend && pnpm run build
# OK
```

### SQL smoke

```sql
-- interview_question_id=1 has 4 snapshot checkpoints
-- After init: state_count = 4, all status=unseen, score_awarded=0
-- ON DUPLICATE KEY UPDATE does not reset existing rows
```

Verified via Docker MySQL against existing `interview_question_checkpoints` data.

### Notes

- States создаются только для текущего main question (не для всех вопросов заранее).
- Транзакционный `query` передаётся в repository для consistent read inside `withTransaction`.
