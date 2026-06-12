# ✅ TASK-01.2 — Базовая конфигурация и валидация env

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Подключить `@nestjs/config` с Joi-схемой: приложение не стартует при невалидных или отсутствующих обязательных env.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовая конфигурация и валидация env» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/src/common/config/env.schema.ts`
- `backend/src/common/config/config.module.ts`
- `backend/.env.example`
- `backend/src/app.module.ts`

## Requirements

1. Пакеты: `@nestjs/config`, `joi`.
2. Обязательные env: `NODE_ENV`, `PORT`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET` (placeholder для блока 03).
3. Опциональные: `LOG_LEVEL`, `GRAPHQL_PLAYGROUND` (boolean).
4. `ConfigModule.forRoot({ isGlobal: true, validationSchema })`.
5. Экспорт typed config через `registerAs` или helper `getEnv()`.

## Step-by-step Plan

1. Установить `@nestjs/config`, `joi`.
2. Создать `env.schema.ts` с Joi.object().
3. Подключить ConfigModule в AppModule.
4. Создать `.env.example` со всеми ключами и комментариями.
5. Проверить: без `.env` — понятная ошибка при старте.
6. Проверить: с валидным `.env` — старт успешен.

## Acceptance Criteria

- Joi валидирует env при bootstrap.
- `.env.example` содержит все переменные блока 01.
- Невалидный env → process exit с понятным сообщением.

## Checks

```bash
cd backend && pnpm run build
cd backend && pnpm run lint
cd backend && env -i PATH="$PATH" node dist/main  # ожидается fail с перечислением missing env
cd backend && NODE_ENV=staging PORT=3000 ... node dist/main  # ожидается fail: invalid NODE_ENV
cd backend && NODE_ENV=development PORT=3456 ... node dist/main & curl http://127.0.0.1:3456/
```

## Completion Notes

**Сделано:**
- Установлены `@nestjs/config`, `joi`.
- `env.schema.ts`: Joi-схема, `registerAs('app')`, typed `AppConfig`, helper `getEnv()`.
- `config.module.ts`: глобальный `AppConfigModule` с `validationOptions.abortEarly: false`.
- `app.module.ts`: импорт `AppConfigModule`.
- `backend/.env.example` со всеми обязательными и опциональными ключами.

**Проверки (все прошли):**
1. `pnpm run build` — OK
2. `pnpm run lint` — OK
3. Старт без env → `Config validation error: "NODE_ENV" is required. "PORT" is required. ...` (exit 1)
4. `NODE_ENV=staging` → `Config validation error: "NODE_ENV" must be one of [development, production, test]` (exit 1)
5. Валидный env, `PORT=3456` → старт OK, `curl GET /` → HTTP 200, `{"name":"AI Interviewer Backend","status":"ok"}`

**Follow-ups:** `main.ts` пока читает `process.env.PORT` напрямую — можно перевести на `ConfigService` в следующих subtasks при необходимости.
