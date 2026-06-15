# TASK-09.3 — Добавить SQL schema для adaptive evidence

Status: [x] done

## Goal

Создать SQL migration для хранения checkpoint state, follow-ups и compact question summaries.

## Source Design

Свериться с:

```txt
docs/database/schemas/adaptive-ai-interview.md
docs/database/CONVENTIONS.md
backend/migrations/005_create_question_bank.sql
backend/migrations/006_create_interview_core.sql
backend/migrations/007_create_ai_evaluation.sql
```

## Scope

- Добавить migration `backend/migrations/013_create_adaptive_ai_interview.sql`.
- Создать таблицы:
  - `interview_checkpoint_states`;
  - `interview_follow_ups`;
  - `interview_question_summaries`.
- Добавить metadata для `interview_messages`:
  - `message_kind`;
  - `parent_message_id`;
  - `target_checkpoint_key`.
- Добавить indexes/FKs.
- Обновить schema docs, если implementation отличается от design.

## Requirements

- MySQL only, raw SQL.
- Без Prisma/TypeORM.
- Migration idempotent where possible.
- Existing rows in `interview_messages` must remain valid.
- `message_kind` nullable or has backwards-compatible default.
- `checkpoint_key` values must be able to map to snapshot `interview_question_checkpoints`.

## Verification

- `pnpm --dir backend run migrate`.
- Повторный `pnpm --dir backend run migrate` не падает.
- SQL check:
  - tables exist;
  - indexes exist;
  - `SHOW CREATE TABLE` confirms FKs.
- `pnpm --dir backend run build`.

## Completion Notes

### Migration

`backend/migrations/013_create_adaptive_ai_interview.sql`

- `ALTER TABLE interview_messages` — nullable `message_kind`, `parent_message_id` (self-FK SET NULL), `target_checkpoint_key`
- `interview_checkpoint_states` — unique `(attempt, question, checkpoint_key)`, status enum, evidence JSON
- `interview_follow_ups` — FK to messages with ON DELETE SET NULL
- `interview_question_summaries` — unique per `(attempt, question)`

`interview_realtime_events` outbox table **не** создана (MVP: socket events after commit без outbox, как в design doc).

### SQL checks

```bash
cd backend && pnpm run migrate
# Applied OK: 013_create_adaptive_ai_interview.sql

cd backend && pnpm run migrate
# Database schema is up to date (no pending migrations).

docker exec <mysql> mysql ... -e "SHOW TABLES LIKE 'interview_checkpoint_states'; ..."
# All 3 tables exist; indexes confirmed; message columns nullable
```

### Build/test

```bash
cd backend && pnpm run build  # OK
```

### Schema deviations

None — matches `docs/database/schemas/adaptive-ai-interview.md` MVP scope (no realtime outbox table).
