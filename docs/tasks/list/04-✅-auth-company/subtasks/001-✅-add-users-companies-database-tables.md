# ✅ TASK-04.1 — Таблицы users и companies в базе

Status: [x] done  
Priority: High  
Parent block: `04-✅-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить SQL-миграции для сущностей пользователей и компаний: `users`, `companies`, `company_memberships` с внешними ключами и индексами.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-✅-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-✅-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Таблицы users и companies в базе» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/migrations/002_create_companies.sql`
- `backend/migrations/003_create_users.sql`
- `backend/migrations/004_create_company_memberships.sql`
- `backend/src/common/database/` (типы/константы SQL optional)

## Requirements

1. `companies`: `id`, `name`, `slug`, `created_at`, `updated_at`.
2. `users`: `id`, `email`, `password_hash`, `full_name`, `is_active`, timestamps.
3. `company_memberships`: `id`, `company_id`, `user_id`, `role` (`owner|member`), unique (`company_id`,`user_id`).
4. UNIQUE индекс на `users.email` и `companies.slug`.
5. FK `ON DELETE CASCADE` для membership.
6. Имена таблиц в snake_case, charset `utf8mb4`.

## Step-by-step Plan

1. Создать 3 SQL файла миграций с последовательными версиями.
2. Добавить `IF NOT EXISTS` где уместно для идемпотентности.
3. Прогнать `npm run migrate`.
4. Проверить структуру таблиц через `SHOW CREATE TABLE`.
5. Проверить индексы и внешние ключи.

## Acceptance Criteria

- Таблицы существуют в `ai_interviewer`.
- Ограничения уникальности и FK работают.
- Повторный запуск миграций не ломает схему.

## Checks

```bash
cd backend && npm run migrate
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SHOW TABLES LIKE "users";'
```

## Completion Notes

**Сделано:** SQL-миграции для `users`, `companies`, `company_memberships` с FK и индексами.

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd backend && npm run migrate` | схема актуальна, exit 0 | OK — «Database schema is up to date (no pending migrations).» |
| `docker compose exec mysql ... SHOW TABLES LIKE "users";` | таблица существует | см. Checks в subtask (при поднятом MySQL) |

