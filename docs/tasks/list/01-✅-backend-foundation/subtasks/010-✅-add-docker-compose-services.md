# ✅ TASK-01.10 — docker-compose сервисы

Status: [x] done  
Last updated: 2026-06-12

## Completion Notes

**Сделано:** корневой `docker-compose.yml` — `mysql`, `redis`, `migrate` (one-shot), `backend`; volumes `mysql_data`, `redis_data`; healthchecks; migrate перед backend.

**Проверки:**
- `docker compose ps` — все сервисы Up/healthy
- `GET /health` → mysql+redis up
- `POST /graphql { hello }` → OK
- migrate logs → `no pending migrations` (идемпотентно)
