# ✅ TASK-01.8 — Таблица schema_migrations

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Last updated: 2026-06-12

## Completion Notes

**Сделано:**
- `migrations/001_create_schema_migrations.sql` — `CREATE TABLE IF NOT EXISTS schema_migrations`.

**Проверки:**
1. `pnpm run migrate` → таблица создана
2. `SELECT * FROM schema_migrations` → `001_create_schema_migrations`
3. Повторный migrate — без дублей
