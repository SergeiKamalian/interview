# ✅ TASK-02.2 — Определить систему миграций

Status: [x] done
Priority: High
Parent block: `02-🟡-database-design`
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

**Сделано:**

- Создан `docs/database/MIGRATIONS.md` (415 строк): runner flow (mermaid), naming `NNN_description.sql`, UP-only policy, rollback/destructive rules, Docker workflows, domain migration groups 002–012.
- Создан `docs/database/schema_migrations.bootstrap.sql.example` — reference DDL, совпадает с `backend/migrations/001_create_schema_migrations.sql`.
- Добавлена ссылка в README блока 02.

**Компромиссы / расхождения с исходным subtask scope:**

- Subtask упоминал формат `YYYYMMDDHHMMSS_` и `version VARCHAR(255) PRIMARY KEY` — задокументирован **фактический** runner из блока 01: `NNN_` prefix, `schema_migrations(id, version VARCHAR(64), applied_at TIMESTAMP)`.
- Checksum tracking (как в captcha-back) не в MVP — зафиксировано policy «never edit applied files».

**Follow-ups:**

- TASK-02.3: `docs/database/schemas/auth-company.md`
- TASK-02.11: точные номера migrations в `IMPLEMENTATION_PLAN.md`

**Проверки:**

| Команда / действие | Ожидание | Результат |
|--------------------|----------|-----------|
| `test -f docs/database/MIGRATIONS.md && wc -l` | файл >100 строк | 415 строк |
| `grep -c schema_migrations MIGRATIONS.md` | множественные упоминания | 23 |
| Bootstrap example vs `001_*.sql` | DDL идентичен | совпадает (кроме header comments) |
| `pnpm run migrate` (backend) | up to date, exit 0 | `Database schema is up to date` |
| `SHOW CREATE TABLE schema_migrations` | id, version VARCHAR(64), applied_at TIMESTAMP | совпадает с документацией |
| `SELECT * FROM schema_migrations` | `001_create_schema_migrations` applied | 1 row |
| grep prisma/typeorm в docs/database | только prohibitions | OK |
| Согласованность с `CONVENTIONS.md` | формат `NNN_` | OK |
