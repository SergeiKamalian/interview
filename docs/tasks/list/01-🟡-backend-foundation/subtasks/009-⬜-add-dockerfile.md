# ⬜ TASK-01.9 — Dockerfile для backend

Status: [ ] todo  
Priority: Medium  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать multi-stage `backend/Dockerfile` для production-like сборки NestJS приложения.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Dockerfile для backend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/Dockerfile`
- `backend/.dockerignore`

## Requirements

1. Multi-stage: builder (npm ci, build) + runner (node:20-alpine).
2. EXPOSE 3000.
3. CMD `node dist/main.js`.
4. USER non-root в runtime stage.
5. .dockerignore: node_modules, dist, .env.

## Step-by-step Plan

1. Создать Dockerfile с build и run stages.
2. Создать .dockerignore.
3. Собрать образ: `docker build -t ai-interviewer-backend ./backend`.
4. Запустить контейнер с env-file — health отвечает.

## Acceptance Criteria

- Образ собирается без ошибок.
- Контейнер стартует и слушает 3000.
- Non-root user в runtime.

## Checks

```bash
docker build -t ai-interviewer-backend ./backend
docker run --rm -p 3000:3000 --env-file backend/.env ai-interviewer-backend
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
