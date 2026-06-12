# ✅ TASK-01.6 — Модуль подключения Redis

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Last updated: 2026-06-12

## Completion Notes

**Сделано:**
- Установлен `ioredis`.
- `RedisModule` (global) + `RedisService` с `ping()`, `onModuleInit` connect, `onModuleDestroy` quit.
- Опциональный `REDIS_PASSWORD` через `process.env`.
- `HealthService`: `checks.redis: up|down`, `status: ok` только если mysql и redis up.

**Проверки:**
1. `pnpm run build` / `pnpm run lint` — OK
2. Старт с MySQL + Redis → `Redis client connected`
3. `GET /health` → `{"status":"ok","checks":{"mysql":"up","redis":"up"}}`
