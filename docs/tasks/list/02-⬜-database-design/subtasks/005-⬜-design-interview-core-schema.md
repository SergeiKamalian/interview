# ⬜ TASK-02.5 — Спроектировать схему interview core

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы interviews, candidates, interview_attempts, interview_questions (snapshot), messages/transcripts для text interview flow.

---

## Context

Interview core связывает company, question bank snapshot и candidate journey. Публичный token, attempt lifecycle и messages — критичные сущности.

---

## Scope

- Создать `docs/database/schemas/interview-core.md`.
- Таблицы: `interviews`, `interview_questions`, `candidates`, `interview_attempts`, `interview_messages`.
- `interviews.public_token` UNIQUE, index.
- Snapshot: `interview_questions` хранит frozen copy question/checkpoints JSON or normalized snapshot.
- `interview_attempts.status` ENUM: `started`, `in_progress`, `completed`, `abandoned`.
- `interview_messages`: `role` (`ai`|`candidate`), `content`, `sequence_order`.

---

## Out of Scope

- Реальные migrations.
- GraphQL interview API (блок 06).
- AI evaluation tables (subtask 006).

---

## Files / Folders Allowed

```txt
docs/database/schemas/interview-core.md
```

---

## Requirements

1. `interviews.company_id` FK, tenant isolation.
2. `candidates` привязан к `interview_id`, email unique per interview optional.
3. `interview_attempts` 1:N messages, 1:1 final evaluation (future).
4. Snapshot design: TEXT/JSON column `question_snapshot` + rationale.
5. `public_token` generation policy documented (crypto random, URL-safe).
6. Indexes для dashboard lists: `(company_id, created_at)`, `(interview_id, status)`.

---

## Step-by-step Plan

1. ER diagram interview domain.
2. DDL для 5 таблиц.
3. Описать attempt lifecycle state machine.
4. Описать snapshot strategy (normalized vs JSON).
5. Public token security notes.
6. Link to question-bank schema.

---

## Acceptance Criteria

- Interview domain schema complete.
- Snapshot strategy documented.
- Public token and attempt status enums defined.
- FK chain company → interview → attempt → messages.

---

## Checks

```bash
test -f docs/database/schemas/interview-core.md
rg "interview_attempts|public_token|interview_messages" docs/database/schemas/interview-core.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
