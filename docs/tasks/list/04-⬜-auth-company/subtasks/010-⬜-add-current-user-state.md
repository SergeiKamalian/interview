# ⬜ TASK-04.10 — Состояние текущего пользователя

Status: [ ] todo  
Priority: High  
Parent block: `04-⬜-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить инициализацию `currentUser` через query `me`, хранение профиля в Redux и подключение JWT в заголовки GraphQL запросов.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-⬜-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-⬜-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Состояние текущего пользователя» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/shared/api/graphqlBaseQuery.ts`
- `frontend/src/features/auth/model/authSlice.ts`
- `frontend/src/app/providers/AppBootstrap.tsx`
- `frontend/src/widgets/layouts/DashboardLayout.tsx`

## Requirements

1. `graphqlBaseQuery` добавляет `Authorization` header если token существует.
2. Endpoint `me` вызывается при старте приложения.
3. authSlice хранит `user`, `company`, `isAuthenticated`, `isBootstrapping`.
4. При 401/UNAUTHENTICATED токен очищается и пользователь логаутится.
5. Dashboard header отображает имя пользователя и компании.

## Step-by-step Plan

1. Добавить helper чтения/очистки токена.
2. Интегрировать `prepareHeaders`/custom headers в baseQuery.
3. Создать bootstrap-компонент для preload `me`.
4. Синхронизировать состояние после refresh страницы.
5. Проверить logout path (manual или stub).

## Acceptance Criteria

- После перезагрузки с токеном пользователь остаётся авторизован.
- `me` синхронизирует frontend state с backend.
- Header GraphQL всегда содержит актуальный bearer token.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
