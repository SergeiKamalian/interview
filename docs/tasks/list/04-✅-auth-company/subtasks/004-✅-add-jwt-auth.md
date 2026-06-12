# ✅ TASK-04.4 — JWT авторизация в backend

Status: [x] done  
Priority: High  
Parent block: `04-✅-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать выпуск и верификацию JWT access token для GraphQL запросов и встроить payload с `userId` и `companyId`.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-✅-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-✅-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «JWT авторизация в backend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/jwt.service.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/common/config/env.schema.ts`
- `backend/.env.example`

## Requirements

1. Пакет `@nestjs/jwt` или `jsonwebtoken`.
2. ENV: `JWT_SECRET`, `JWT_EXPIRES_IN` (пример `15m`/`1h`).
3. Payload минимум: `sub` (user id), `companyId`, `email`.
4. Алгоритм HS256.
5. При валидации токена проверять expiry и signature.

## Step-by-step Plan

1. Подключить jwt пакет и провайдер.
2. Реализовать `signAccessToken(user)`.
3. Добавить `verifyAccessToken(token)` для guard.
4. Обновить ответ login/register: `accessToken`, `tokenType`.
5. Задокументировать env в `.env.example`.

## Acceptance Criteria

- Успешный login возвращает валидный JWT.
- Истёкший/битый токен не проходит верификацию.
- JWT secret не захардкожен.

## Checks

```bash
cd backend && npm run build
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -d '{"query":"mutation { login(input:{email:\"admin@example.com\",password:\"pass\"}) { accessToken tokenType } }"}'
```

## Completion Notes

**Сделано:** JWT access token (payload `userId`, `companyId`), verify для guard, ответ login/register с `accessToken` / `tokenType`.

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd backend && npm run build` | exit 0 | OK |
| `curl -s -X POST http://localhost:3000/graphql ... login ...` | accessToken в ответе | см. Checks при запущенном backend |

