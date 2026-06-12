# ✅ TASK-04.2 — Базовый AuthModule в backend

Status: [x] done  
Priority: High  
Parent block: `04-✅-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать модуль аутентификации в NestJS с сервисами для регистрации и логина, репозиториями raw SQL и DTO для GraphQL input.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-✅-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-✅-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовый AuthModule в backend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.repository.ts`
- `backend/src/modules/users/users.repository.ts`
- `backend/src/modules/auth/dto/register.input.ts`
- `backend/src/modules/auth/dto/login.input.ts`

## Requirements

1. `AuthService` инкапсулирует бизнес-логику регистрации/логина.
2. Репозитории используют `DatabaseService.query`.
3. Валидация input: email format, min длина пароля, required `fullName`.
4. Конфликты email возвращают доменную ошибку (`USER_EMAIL_EXISTS`).
5. Без выдачи пароля/хэша наружу.

## Step-by-step Plan

1. Создать `AuthModule` и подключить его в `AppModule`.
2. Реализовать методы `register()` и `login()` без JWT на этом шаге (можно вернуть user stub).
3. Добавить базовые unit-тесты сервиса (optional).
4. Согласовать типы `UserEntity` и маппинг из SQL строк.

## Acceptance Criteria

- AuthModule компилируется и подключен.
- Сервисы не протекают деталями БД наружу.
- Ошибки валидации и duplicate email обрабатываются.

## Checks

```bash
cd backend && npm run build
cd backend && npm run lint
```

## Completion Notes

**Сделано:** NestJS `AuthModule` с сервисами register/login, репозиториями raw SQL, GraphQL input DTO.

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd backend && npm run build` | exit 0 | OK |
| `cd backend && npm run lint` | exit 0 | OK |

