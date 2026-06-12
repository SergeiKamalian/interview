# ⬜ TASK-04.6 — Создание компании при регистрации

Status: [ ] todo  
Priority: High  
Parent block: `04-⬜-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать бизнес-логику, где регистрация первого пользователя создаёт компанию и связывает пользователя как `owner` в `company_memberships`.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-⬜-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-⬜-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Создание компании при регистрации» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/companies/companies.repository.ts`
- `backend/src/modules/companies/company-slug.util.ts`
- `backend/src/modules/auth/dto/register.input.ts`

## Requirements

1. `register` принимает `companyName`.
2. Company slug генерируется транслитерацией/slugify и проверкой уникальности.
3. Операция выполняется в SQL-транзакции: company + user + membership.
4. Role по умолчанию: `owner`.
5. Rollback при любой ошибке в транзакции.

## Step-by-step Plan

1. Добавить поле `companyName` в RegisterInput.
2. Создать repository для companies и memberships.
3. Обернуть multi-step insert в транзакцию.
4. Проверить коллизию slug (`acme`, `acme-2` ...).
5. Обновить тестовые сценарии регистрации.

## Acceptance Criteria

- После register есть записи во всех 3 таблицах.
- Пользователь автоматически становится owner своей компании.
- Транзакционность защищает от частичных записей.

## Checks

```bash
cd backend && npm run build
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SELECT c.name,m.role FROM companies c JOIN company_memberships m ON m.company_id=c.id;'
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
