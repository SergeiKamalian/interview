# ⬜ TASK-04.9 — Защищённые dashboard маршруты

Status: [ ] todo  
Priority: Medium  
Parent block: `04-⬜-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Внедрить auth-aware router: доступ к `/dashboard` только для авторизованного пользователя, неавторизованный редиректится на `/login`.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-⬜-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-⬜-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Защищённые dashboard маршруты» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `frontend/src/app/router/routes.tsx`
- `frontend/src/app/router/ProtectedRoute.tsx`
- `frontend/src/features/auth/model/selectors.ts`

## Requirements

1. `ProtectedRoute` проверяет наличие валидного токена или текущего пользователя.
2. Для неавторизованного состояния используется `<Navigate to='/login' replace />`.
3. Авторизованный пользователь не должен видеть `/login`/`/register` (redirect to dashboard).
4. Состояние loading учитывается при bootstrap `me` запроса.

## Step-by-step Plan

1. Создать wrapper `ProtectedRoute`.
2. Обновить route config для dashboard layout.
3. Добавить guard для публичных auth-страниц (optional).
4. Прогнать ручные сценарии входа/выхода.

## Acceptance Criteria

- Dashboard недоступен без авторизации.
- Редиректы консистентны и не зацикливаются.
- Маршрутизация готова для следующих блоков.

## Checks

```bash
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
