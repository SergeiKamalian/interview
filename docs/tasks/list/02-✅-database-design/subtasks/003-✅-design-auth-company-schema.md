# ✅ TASK-02.3 — Спроектировать схему auth и companies

Status: [x] done
Priority: High
Parent block: `02-🟡-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы `users`, `companies`, `company_memberships` с FK, unique constraints и индексами для B2B multi-tenant auth.

---

## Context

Auth — первый доменный слой данных после инфраструктуры. Схема должна поддерживать регистрацию компании, привязку пользователя к company, уникальность email и задел под роли.

---

## Scope

- Создать `docs/database/schemas/auth-company.md`.
- Таблицы: `companies`, `users`, `company_memberships`.
- Поля: `password_hash`, `email`, `company_id`, `role`, timestamps.
- Unique: `users.email`, `companies.slug` (optional).
- FK: `users` → `companies`, `company_memberships` → both.
- Индексы для login lookup и tenant isolation.

---

## Out of Scope

- Реальные SQL migration files.
- NestJS AuthModule implementation (блок 04).
- JWT/Redis session tables (post-MVP).

---

## Files / Folders Allowed

```txt
docs/database/schemas/auth-company.md
docs/database/schemas/auth-company.diagram.md (optional ER diagram)
```

---

## Requirements

1. ER-описание каждой таблицы: column, type, nullable, default, comment.
2. `password_hash` VARCHAR(255), never plaintext.
3. `company_id BIGINT UNSIGNED NOT NULL` на tenant-scoped tables.
4. `company_memberships.role` ENUM или VARCHAR с documented values: `owner`, `member`.
5. Soft delete policy: зафиксировать — users не soft-delete в MVP.
6. Пример SQL DDL в markdown code block (design reference, not migration file).

---

## Step-by-step Plan

1. Описать бизнес-правила: one company per registration flow.
2. Нарисовать ER (mermaid erDiagram).
3. Заполнить таблицы columns/types/constraints.
4. Перечислить indexes и rationale.
5. Review against CONVENTIONS.md.
6. Указать будущий migration filename example.

---

## Acceptance Criteria

- Документ содержит полный DDL design для 3 таблиц.
- FK и unique constraints явно указаны.
- Multi-tenant через `company_id` соблюдён.
- Согласовано с блоком 04 auth-company.

---

## Checks

```bash
test -f docs/database/schemas/auth-company.md
rg "users|companies|company_memberships" docs/database/schemas/auth-company.md
```

---

## Completion Notes

**Сделано:**

- Создан `docs/database/schemas/auth-company.md` (361 строка).
- ER diagram (mermaid), column specs, indexes, FK, register/login flows.
- DDL reference для migrations `002`–`004`.
- Ссылка в README блока 02.

**Компромиссы:**

- Subtask scope упоминал FK `users → companies` — по `CONVENTIONS.md` `users` global **без** `company_id`; tenant access только через `company_memberships`.
- Добавлен `is_active` на `companies` и `users` (не в TASK-04.1, но согласован с CONVENTIONS examples).
- Три migration files (002–004) вместо одного — как в TASK-04.1.

**Follow-ups:**

- TASK-02.4: `docs/database/schemas/question-bank.md`
- Block 04: реальные SQL migrations по этому design doc

**Проверки:**

| Команда / действие | Ожидание | Результат |
|--------------------|----------|-----------|
| `test -f docs/database/schemas/auth-company.md` | exists | OK |
| grep users/companies/memberships | множественные | 72 строки |
| `password_hash VARCHAR(255)` | documented | 7 упоминаний |
| `deleted_at` on users | нет в DDL | только в out-of-scope |
| `users` без `company_id` | per CONVENTIONS | явно задокументировано |
| FK CASCADE on memberships | yes | OK |
| roles owner/member | ENUM | OK |
| TASK-04.1 fields match | companies, users, memberships | OK (+ is_active) |
| Migration filenames | 002, 003, 004 | совпадает с TASK-04.1 |
