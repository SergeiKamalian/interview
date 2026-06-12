# ⬜ TASK-04.7 — GraphQL auth guards и CurrentUser

Status: [ ] todo  
Priority: High  
Parent block: `04-⬜-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить guard для GraphQL, извлечение JWT из заголовка и декоратор `@CurrentUser()` для получения пользователя в resolver.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-⬜-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-⬜-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «GraphQL auth guards и CurrentUser» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/guards/gql-auth.guard.ts`
- `backend/src/modules/auth/decorators/current-user.decorator.ts`
- `backend/src/modules/auth/auth-context.service.ts`
- `backend/src/modules/auth/auth.resolver.ts`

## Requirements

1. Guard читает `Authorization` из `req.headers`.
2. Формат только `Bearer <token>`.
3. В контекст добавляется объект `currentUser` (`id`, `email`, `companyId`).
4. `@UseGuards(GqlAuthGuard)` на защищённых query/mutation.
5. Единая ошибка `UNAUTHENTICATED` при отсутствии/невалидности токена.

## Step-by-step Plan

1. Реализовать GqlAuthGuard через `CanActivate` + `GqlExecutionContext`.
2. Добавить decorator `CurrentUser`.
3. Защитить `me` и будущие dashboard операции.
4. Проверить `me` без токена -> ошибка, с токеном -> успех.

## Acceptance Criteria

- Защищённые резолверы требуют JWT.
- Current user доступен через декоратор.
- Unauthorized ответы единообразны.

## Checks

```bash
cd backend && npm run build
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -d '{"query":"{ me { id email } }"}'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
