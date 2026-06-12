# ⬜ TASK-02.3 — Спроектировать схему auth и companies

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
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

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
