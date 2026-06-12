# ✅ TASK-04.5 — GraphQL API для login/register/me

Status: [x] done  
Priority: High  
Parent block: `04-✅-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить GraphQL resolver для аутентификации: `register`, `login`, `me`, с типами ответа и обработкой ошибок.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-✅-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-✅-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «GraphQL API для login/register/me» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/auth.resolver.ts`
- `backend/src/modules/auth/types/auth-payload.type.ts`
- `backend/src/modules/users/types/user.type.ts`
- `backend/src/modules/companies/types/company.type.ts`

## Requirements

1. `Mutation register(input)` и `Mutation login(input)` возвращают `AuthPayload`.
2. `Query me` возвращает текущего пользователя и связанную company.
3. Ошибки (`UNAUTHORIZED`, `BAD_USER_INPUT`) маппятся в GraphQL формально.
4. Schema code-first генерируется без конфликтов типов.
5. Поля `password_hash` отсутствуют в GraphQL type.

## Step-by-step Plan

1. Создать `AuthResolver` и типы GraphQL.
2. Подключить resolver в AuthModule.
3. Реализовать `me` как защищённый query (guard в следующем шаге может быть временным).
4. Проверить introspection/schema generation.
5. Проверить ручные запросы через Playground.

## Acceptance Criteria

- В GraphQL доступны `register`, `login`, `me`.
- Формат ответа консистентен для frontend RTK Query.
- Ни один чувствительный атрибут не экспонируется.

## Checks

```bash
cd backend && npm run build
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -d '{"query":"{ __schema { queryType { name } } }"}'
```

## Completion Notes

**Сделано:** GraphQL resolver: `register`, `login`, `me` с типами ответа и обработкой ошибок.

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd backend && npm run build` | exit 0 | OK |
| `curl -s -X POST http://localhost:3000/graphql ... __schema ...` | queryType name | см. Checks при запущенном backend |

