# ✅ TASK-01.5 — Модуль подключения MySQL

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать `DatabaseModule` с `mysql2` connection pool, health-проверкой и injectable `DatabaseService` для raw SQL запросов.

## Completion Notes

**Сделано:**
- Установлен `mysql2`.
- `DatabaseModule` (global) + `DatabaseService` + `database.types.ts`.
- Pool из env (`MYSQL_*`), `query<T>()`, `ping()`, `onModuleInit` (SELECT 1), `onModuleDestroy` (pool.end()).
- `HealthService` расширен: `checks.mysql: up|down`, `status: ok|degraded`.
- Подключено в `AppModule`.

**Проверки (все прошли):**
1. `pnpm run build` / `pnpm run lint` — OK
2. Docker MySQL (`mysql:8.4`, port 3307) + `MYSQL_HOST=localhost` → старт OK, лог `MySQL connection pool initialized`
3. `curl GET /health` → `{"status":"ok","checks":{"mysql":"up"},...}`
4. `POST /graphql { hello }` → OK (предыдущий функционал не сломан)
5. Неверный `MYSQL_PORT=59999` → старт падает с `MySQL connectivity check failed on startup`

**Follow-ups:** для Docker MySQL на macOS использовать `MYSQL_HOST=localhost`, не `127.0.0.1` (иначе `PROTOCOL_CONNECTION_LOST`).
