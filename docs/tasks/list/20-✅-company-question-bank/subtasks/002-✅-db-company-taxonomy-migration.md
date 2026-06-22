# TASK-20.2 — DB migration: company taxonomy overlay

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.1  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Добавить SQL migration для company overlay: taxonomy scope, question metadata, overrides table.

---

## Context

- Migration runner + `schema_migrations` (конвенция captcha-back)
- Следующий номер migration — проверить `backend/migrations/` (ожидаемо `027_...`)
- Design source: `docs/database/schemas/company-question-bank.md` (TASK-20.1)

---

## Scope

1. **Migration SQL** `backend/migrations/027_company_question_bank_overlay.sql` (номер уточнить):

   **topics / skills:**
   - `ADD company_id BIGINT UNSIGNED NULL` + FK → `companies` ON DELETE CASCADE
   - Заменить/дополнить unique: global `code` unique когда `company_id IS NULL`; `(company_id, code)` unique когда NOT NULL
   - Индексы `(company_id, is_active)`

   **questions:**
   - `source_question_id BIGINT UNSIGNED NULL` FK → `questions(id)` ON DELETE SET NULL
   - `status ENUM('draft','published') NOT NULL DEFAULT 'published'`
   - `company_priority TINYINT UNSIGNED NOT NULL DEFAULT 0` (0–10)
   - `is_required TINYINT(1) NOT NULL DEFAULT 0`
   - Индекс `(company_id, status, is_required)`

   **company_question_overrides:**
   - PK, `company_id`, `source_question_id`, JSON/text поля для extra hints/examples
   - UNIQUE `(company_id, source_question_id)`
   - FK constraints + tenant indexes

2. **Backfill:** existing company questions → `status=published`, defaults для новых полей

3. Sync `docs/database/schemas/company-question-bank.md` и `question-bank.md` если нужны правки после DDL

---

## Out of Scope

- GraphQL resolvers
- Data migration из Excel
- Изменение interview snapshot tables (merge logic — TASK-20.5)

---

## Files / Folders Allowed

```txt
backend/migrations/027_*.sql
docs/database/schemas/company-question-bank.md
docs/database/schemas/question-bank.md
```

---

## Verification

- `pnpm -C backend migrate` → Applied OK
- `DESCRIBE topics/skills/questions` — новые колонки
- `SHOW CREATE TABLE company_question_overrides`
- Повторный migrate — idempotent skip
- Existing global data не сломан (company_id NULL на всех global rows)

---

## Completion Notes

**Created:** `backend/migrations/027_company_question_bank_overlay.sql`

**Commands:**
- `cd backend && set -a && source ../.env && set +a && pnpm migrate` → `Applied OK: 027_company_question_bank_overlay.sql`
- Повторный `pnpm migrate` → `Database schema is up to date (no pending migrations).`
- `docker exec ai-interviewer-local-mysql-1 mysql ... DESCRIBE skills/topics/questions; SHOW CREATE TABLE company_question_overrides`

**Expected / actual:**
- `skills` / `topics`: `company_id` NULL, FK CASCADE, `uq_*_company_code (company_id, code)`, `idx_*_company_active`
- `questions`: `source_question_id`, `status=published`, `company_priority=0`, `is_required=0`, index `(company_id, status, is_required)`
- `company_question_overrides` created with JSON columns + unique `(company_id, source_question_id)`
- Global backfill: 20 skills + 564 topics with `company_id IS NULL`; all questions `status=published`

**Doc sync:** pointer в `docs/database/schemas/question-bank.md` на overlay columns (migration 027).

**Issues:** none.
