# ✅ TASK-01.7 — SQL migration runner

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Last updated: 2026-06-12

## Completion Notes

**Сделано:**
- `src/migrate/migration-runner.service.ts` — читает `migrations/*.sql`, применяет по prefix `NNN_`, транзакция на миграцию.
- `src/migrate/main.ts` — CLI entrypoint, загрузка `backend/.env`.
- `pnpm run migrate` в `package.json`.

**Проверки:**
1. `pnpm run build` / `pnpm run lint` — OK
2. Первый `pnpm run migrate` → `Applied OK: 001_create_schema_migrations.sql`
3. Повторный `pnpm run migrate` → `no pending migrations` (идемпотентно)
