# ✅ TASK-01.1 — Создание структуры NestJS-приложения

Status: [x] done  
Priority: High  
Parent block: `01-🟡-backend-foundation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать NestJS-проект в `backend/` с модульной структурой, npm scripts и entrypoint `main.ts`, готовый к подключению Config, GraphQL и Database модулей.

## Context

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`. Эталон для сравнения перед созданием структуры: `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`.

Эта подзадача — часть блока `01-🟡-backend-foundation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Создание структуры NestJS-приложения» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Files / Folders Allowed

- `backend/package.json`
- `backend/nest-cli.json`
- `backend/tsconfig.json`
- `backend/tsconfig.build.json`
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/app.controller.ts` (optional stub)
- `backend/src/app.service.ts`
- `backend/src/modules/` (пустые placeholder)
- `backend/src/common/`
- `backend/.gitignore`
- `backend/.prettierrc`
- `backend/eslint.config.mjs`

## Requirements

1. NestJS 10+, Node 20 LTS.
2. Перед созданием scaffold сверить структуру с `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back` и взять оттуда подходы к `src/`, config и scripts, не копируя unrelated business code.
3. Scripts: `start:dev`, `build`, `start:prod`, `lint`, `test`.
4. Path alias `@app/*` → `src/*` в tsconfig.
5. `AppModule` импортирует только базовые зависимости (пока без DB).
6. Global `ValidationPipe` в `main.ts` с `whitelist: true`.
7. Порт из env `PORT` (default 3000).

## Step-by-step Plan

1. `cd backend && npm install` (или `nest new` с переносом в `backend/`).
2. Создать `src/modules/` и `src/common/` с `.gitkeep` или README stub.
3. Настроить `nest-cli.json`, `tsconfig.build.json`.
4. В `main.ts`: bootstrap, ValidationPipe, listen PORT.
5. Проверить `npm run start:dev` — сервер слушает порт.
6. Проверить `npm run build` — dist собирается без ошибок.

## Acceptance Criteria

- Backend слушает `PORT`.
- Структура `src/modules/`, `src/common/` создана.
- `npm run build` и `npm run lint` успешны.
- Нет секретов в коде.

## Checks

```bash
cd backend && npm run build
cd backend && npm run lint
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || true
```

## Completion Notes

Выполнено 2026-06-12.

- Создан минимальный NestJS scaffold в `backend/` без `nest new`.
- Сверено с эталоном backend: `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`.
- Добавлены `package.json`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`.
- Созданы `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, `src/modules/`, `src/common/`.
- Установлены NestJS 11 зависимости через `pnpm`; создан `backend/pnpm-lock.yaml`.
- Проверки пройдены: `pnpm run build`, `pnpm run lint`, smoke `GET /` → `200`.
- Компромисс: `incremental` отключён в `tsconfig.json`, потому что `nest build` удаляет `dist`, а TypeScript incremental мог пропустить emit и ломал `nest start`.
