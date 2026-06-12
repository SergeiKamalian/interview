# ⬜ TASK-04.8 — Frontend формы login/register

Status: [ ] todo  
Priority: High  
Parent block: `04-⬜-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать страницы `/login` и `/register` с формами, GraphQL мутациями, обработкой ошибок и сохранением access token в client state.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-⬜-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-⬜-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Frontend формы login/register» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/RegisterPage.tsx`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/features/auth/model/authSlice.ts`
- `frontend/src/shared/lib/token-storage.ts`

## Requirements

1. RTK Query endpoints: `login`, `register`.
2. Поля register: `email`, `password`, `fullName`, `companyName`.
3. Валидация на клиенте: required, email format, min password 8.
4. После успеха токен сохраняется (`localStorage`/`sessionStorage`).
5. Показывать backend error message в Alert компоненте.

## Step-by-step Plan

1. Создать authApi через `baseApi.injectEndpoints`.
2. Собрать формы на `shared/ui` primitives.
3. Добавить редирект на `/dashboard` после успеха.
4. Интегрировать с authSlice (`setCredentials`).
5. Проверить UX: loading/disabled states.

## Acceptance Criteria

- Login/register работают от реального GraphQL backend.
- Токен сохраняется и может использоваться в следующих запросах.
- Ошибки пользователя отображаются понятно.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
