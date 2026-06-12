# ⬜ TASK-01.12 — README backend и примеры .env

Status: [ ] todo  
Priority: Medium  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Написать `backend/README.md` с инструкциями локального запуска, docker-compose, migrate и полным списком env.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «README backend и примеры .env» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/README.md`
- `backend/.env.example`
- root `.env.example` (если не создан в 010)

## Requirements

1. Разделы README: Prerequisites, Local dev, Docker, Migrations, GraphQL, Health, Env reference.
2. Каждая env переменная: имя, описание, example value.
3. Команды: `npm run start:dev`, `npm run migrate`, `docker compose up`.
4. Ссылка на `docs/DECISIONS.md` — SQL migrations, no ORM.

## Step-by-step Plan

1. Дополнить `.env.example` всеми переменными.
2. Написать README с copy-paste командами.
3. Проверить: новый разработчик может поднять проект по README.

## Acceptance Criteria

- README покрывает setup end-to-end.
- .env.example синхронизирован с Joi schema.
- Нет упоминания Prisma.

## Checks

```bash
test -f backend/README.md && test -f backend/.env.example
grep -c '=' backend/.env.example
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
