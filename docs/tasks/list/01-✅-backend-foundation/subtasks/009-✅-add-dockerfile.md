# ✅ TASK-01.9 — Dockerfile для backend

Status: [x] done  
Last updated: 2026-06-12

## Completion Notes

**Сделано:** `backend/Dockerfile` (multi-stage builder + runner, node:20-alpine), `backend/.dockerignore`, USER `nestjs`, EXPOSE 3000, CMD `node dist/main.js`, pnpm@10.8.1 pinned.

**Проверки:** `docker compose build backend` — OK; контейнер стартует; `whoami` → `nestjs`.
