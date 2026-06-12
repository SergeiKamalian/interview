# 02-✅-database-design — Проектирование базы данных

## Design documents

- [`docs/database/README.md`](../../../database/README.md) — index
- [`docs/database/CONVENTIONS.md`](../../../database/CONVENTIONS.md)
- [`docs/database/MIGRATIONS.md`](../../../database/MIGRATIONS.md)
- [`docs/database/INDEXES_AND_PERFORMANCE.md`](../../../database/INDEXES_AND_PERFORMANCE.md)
- [`docs/database/IMPLEMENTATION_PLAN.md`](../../../database/IMPLEMENTATION_PLAN.md)
- [`docs/database/schemas/`](../../../database/schemas/) — 7 domain schemas

## SQL migrations (applied)

```txt
backend/migrations/001–010  →  33 tables + 3 views in MySQL
```

Apply: `cd backend && pnpm run migrate`

## Статус

**Блок завершён** (11/11 subtasks). Следующий блок: `03-⬜-frontend-foundation` или `04-⬜-auth-company` (app code).

## Цель блока

Спроектировать полную SQL-first схему MySQL для AI Interviewer Platform **до** реализации feature-блоков: conventions, migration policy, доменные ER/DDL design docs, indexes и implementation plan.

## Контекст

Продукт хранит много связанных доменов: companies, question bank (source of truth), interviews, AI evaluations, media metadata, analytics, ATS logs. Отдельный design-блок фиксирует единую модель данных по аналогии с `captcha-back`: raw SQL, explicit constraints, migration runner, `schema_migrations`.

## Ожидаемый результат после завершения блока

В `docs/database/` полный комплект design-документов + migrations `001`–`010` в `backend/migrations/`. Feature-блоки 04–10 реализуют application code поверх этой схемы.
