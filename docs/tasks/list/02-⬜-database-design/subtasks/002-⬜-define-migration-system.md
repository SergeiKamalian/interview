# ⬜ TASK-02.2 — Определить систему миграций

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Описать политику SQL-миграций: формат файлов, naming, `schema_migrations`, порядок применения, rollback policy и связь с Docker `migrate` service.

---

## Context

Блок 01 создаёт migration runner и таблицу `schema_migrations`. Блок 02 должен зафиксировать **дизайн-правила** для всех будущих миграций до их реализации в feature-блоках.

---

## Scope

- Создать `docs/database/MIGRATIONS.md`.
- Формат имени файла: `YYYYMMDDHHMMSS_description.sql`.
- Структура migration file: UP only (MVP), комментарии, explicit FK/indexes.
- Таблица `schema_migrations(version VARCHAR(255) PRIMARY KEY, applied_at DATETIME)`.
- Правила идемпотентности и запрета destructive changes без ADR.
- Связь с `backend/migrations/` и Docker service `migrate`.
- Порядок: bootstrap → auth → question bank → interview → AI → media → analytics → ATS.

---

## Out of Scope

- Написание реальных migration SQL.
- Изменение кода migration runner.
- Production backup/restore (блок 11).

---

## Files / Folders Allowed

```txt
docs/database/MIGRATIONS.md
docs/database/schema_migrations.bootstrap.sql.example (только example, не real migration)
```

---

## Requirements

1. Описать runner flow: scan dir → check schema_migrations → apply new → record version.
2. Запретить Prisma migrations и ORM auto-sync.
3. Каждая миграция — один логический change set.
4. FK и indexes создаются в той же миграции, что и таблица (где возможно).
5. Пример bootstrap migration для `schema_migrations` (как reference, не deploy).
6. Документировать dev workflow: `docker compose run migrate`.

---

## Step-by-step Plan

1. Создать `MIGRATIONS.md` с диаграммой flow (mermaid optional).
2. Описать naming convention для migration files.
3. Добавить example bootstrap SQL (commented as design reference).
4. Описать порядок доменных migration groups 003-009 subtasks.
5. Ссылка из README блока 02.

---

## Acceptance Criteria

- `MIGRATIONS.md` описывает полный lifecycle миграций.
- Есть example `schema_migrations` DDL.
- Порядок доменных миграций согласован с subtasks 003-009.
- Явный запрет ORM-based migrations.

---

## Checks

```bash
test -f docs/database/MIGRATIONS.md
rg "schema_migrations" docs/database/MIGRATIONS.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
