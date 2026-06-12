# ⬜ TASK-02.10 — Определить индексы, constraints и performance

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Свести все доменные схемы и зафиксировать единый каталог indexes, FK, unique constraints и performance notes.

---

## Context

После subtasks 003-009 нужен cross-cutting review: нет ли дублирующих индексов, missing FK, или hot path без index.

---

## Scope

- Создать `docs/database/INDEXES_AND_PERFORMANCE.md`.
- Сводная таблица всех indexes по доменам.
- Сводная таблица всех FK с ON DELETE policy.
- Query hot paths: login, public token lookup, dashboard list, analytics GROUP BY.
- EXPLAIN-примеры (design reference) для 3 critical queries.

---

## Out of Scope

- Создание реальных indexes в migrations.
- Load testing.

---

## Files / Folders Allowed

```txt
docs/database/INDEXES_AND_PERFORMANCE.md
docs/database/schemas/*.md (read-only cross-reference updates)
```

---

## Requirements

1. Каждый FK явно указывает ON DELETE RESTRICT/CASCADE policy.
2. Tenant queries always filter `company_id` — composite indexes documented.
3. No redundant indexes list.
4. Pagination indexes: `(company_id, created_at DESC)`.
5. Public token index UNIQUE on `interviews.public_token`.

---

## Step-by-step Plan

1. Прочитать все schema docs 003-009.
2. Extract all proposed indexes/FK.
3. Build master index catalog.
4. Identify 3 hot queries and recommend EXPLAIN checks.
5. Resolve conflicts between domain docs.
6. Update schema docs if inconsistencies found.

---

## Acceptance Criteria

- Master index/FK catalog exists.
- ON DELETE policies defined for all FK.
- Hot path queries documented with required indexes.
- No unresolved conflicts between domain schemas.

---

## Checks

```bash
test -f docs/database/INDEXES_AND_PERFORMANCE.md
wc -l docs/database/INDEXES_AND_PERFORMANCE.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
