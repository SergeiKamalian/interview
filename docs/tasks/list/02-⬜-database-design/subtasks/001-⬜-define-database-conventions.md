# ⬜ TASK-02.1 — Определить конвенции базы данных

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Зафиксировать единые правила именования таблиц, колонок, индексов, FK, enum-значений и типов данных для всего проекта MySQL.

---

## Context

Перед проектированием доменных схем нужен общий стандарт, как в `captcha-back`: snake_case, явные PK/FK, `created_at`/`updated_at`, soft delete только где нужно. Без этого каждый feature-блок будет проектировать таблицы по-своему.

---

## Scope

- Создать документ `docs/database/CONVENTIONS.md`.
- Описать naming: таблицы plural snake_case (`users`, `interview_attempts`).
- Описать PK: `BIGINT UNSIGNED AUTO_INCREMENT` или `CHAR(36)` UUID — выбрать и зафиксировать.
- Описать стандартные колонки: `id`, `created_at`, `updated_at`, `deleted_at` (optional).
- Описать FK naming: `fk_<child>_<parent>_<column>`.
- Описать index naming: `idx_<table>_<columns>`, `uq_<table>_<columns>`.
- Описать charset/collation: `utf8mb4` / `utf8mb4_unicode_ci`.
- Описать money/score types: `DECIMAL(5,2)` для score 0-10.
- Описать JSON columns policy: когда JSON допустим vs нормализованные таблицы.

---

## Out of Scope

- Создание реальных `.sql` migration files.
- Реализация migration runner (блок 01).
- Prisma/TypeORM schema.
- PostgreSQL/MongoDB варианты.

---

## Files / Folders Allowed

```txt
docs/database/CONVENTIONS.md
docs/tasks/list/02-⬜-database-design/README.md (ссылка на conventions)
```

---

## Requirements

1. Документ на русском, технические имена на английском.
2. Явный запрет Prisma, TypeORM, auto-generated ORM schema.
3. Примеры хороших и плохих имён таблиц/колонок.
4. Правило multi-tenant: `company_id` на всех company-scoped таблицах.
5. Правило публичных сущностей: `public_token` отдельно от PK.
6. Версионирование design docs через git, не через migrations.

---

## Step-by-step Plan

1. Создать папку `docs/database/`.
2. Написать `CONVENTIONS.md` с разделами: Tables, Columns, Indexes, FK, Types, Multi-tenant, Timestamps.
3. Добавить примеры для `users`, `companies`, `questions`, `interview_attempts`.
4. Сверить с подходом `captcha-back` (raw SQL, explicit constraints).
5. Добавить ссылку в README блока 02.
6. Self-review: нет противоречий с `docs/DECISIONS.md`.

---

## Acceptance Criteria

- `docs/database/CONVENTIONS.md` существует и покрывает все пункты Scope.
- Явно указано: MySQL, SQL-first, no ORM.
- Есть примеры naming для минимум 4 доменных таблиц.
- Multi-tenant правило `company_id` задокументировано.

---

## Checks

```bash
test -f docs/database/CONVENTIONS.md && wc -l docs/database/CONVENTIONS.md
rg -i "prisma|typeorm|mongodb|postgresql" docs/database/CONVENTIONS.md && echo "should be only in prohibitions"
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
