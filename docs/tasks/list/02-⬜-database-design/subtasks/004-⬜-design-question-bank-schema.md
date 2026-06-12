# ⬜ TASK-02.4 — Спроектировать схему question bank

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать нормализованную схему банка вопросов: professions, skills, topics, questions, ideal answers, checkpoints, weights, good/bad examples.

---

## Context

Question bank — source of truth продукта. AI не придумывает критерии; все checkpoints и веса хранятся в БД. Схема должна поддерживать фильтрацию по profession/stack/level/topic.

---

## Scope

- Создать `docs/database/schemas/question-bank.md`.
- Таблицы: `professions`, `skills`, `topics`, `questions`, `question_skills` (M2M), `ideal_answers`, `checkpoints`, `checkpoint_weights`, `answer_examples`.
- Поля вопроса: `question_text`, `short_answer`, `ideal_answer`, `max_score`, `difficulty`, `level`.
- Checkpoints: `key`, `title`, `expected`, `score` weight.
- Good/bad examples: `example_type` ENUM `good`|`bad`, `text`.
- Company scope: global seed + optional `company_id` override (зафиксировать policy).

---

## Out of Scope

- Реальные migrations.
- GraphQL CRUD (блок 05).
- Seed SQL execution.

---

## Files / Folders Allowed

```txt
docs/database/schemas/question-bank.md
```

---

## Requirements

1. Нормализация: checkpoints отдельная таблица, не JSON blob (MVP).
2. `checkpoints.key` уникален в рамках `question_id`.
3. Сумма weights checkpoints = `questions.max_score`.
4. `answer_examples` связана с `question_id`.
5. Индексы: `(profession_id, level, difficulty)`, `(topic_id)`, `(company_id)`.
6. Snapshot policy: при создании interview вопросы копируются в interview snapshot (design note for block 06).

---

## Step-by-step Plan

1. ER diagram всех question bank таблиц.
2. DDL design для каждой таблицы.
3. Пример одного вопроса useEffect с 5 checkpoints (как в PROJECT.md).
4. Описать global vs company-specific questions policy.
5. Cross-reference с блоком 05 question-bank.

---

## Acceptance Criteria

- Полная схема question bank задокументирована.
- Checkpoints и weights нормализованы.
- Good/bad examples включены.
- Source of truth principle явно указан.

---

## Checks

```bash
test -f docs/database/schemas/question-bank.md
rg "checkpoints|ideal_answers|answer_examples" docs/database/schemas/question-bank.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
