# 04-✅-auth-company — Аутентификация и компании

## Цель блока

Реализовать полноценный auth-контур для B2B: users/companies в MySQL, bcrypt-хэширование, JWT access token, GraphQL auth API, guards в NestJS и базовый login/register flow на React.

## Контекст

После блоков 01–03 уже есть каркас backend, спроектированная схема БД и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

## Что входит в этот блок

- Таблицы `users`, `companies`, `company_memberships` и индексы уникальности.
- NestJS `AuthModule` + `UsersModule` + сервисы регистрации/логина.
- Bcrypt password hashing + проверка пароля при логине.
- JWT access token (`Authorization: Bearer <token>`) для GraphQL.
- GraphQL мутации `register`, `login` и query `me`.
- Автоматическое создание company при регистрации первого пользователя.
- GqlAuthGuard и декоратор `@CurrentUser()`.
- Frontend страницы `/login`, `/register`, форма и отправка в GraphQL.
- Protected route `/dashboard` и bootstrap current user state.

## Что НЕ входит в этот блок

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Важные архитектурные решения

- NestJS GraphQL code-first, guards через `GqlExecutionContext`.
- MySQL raw SQL migrations в `backend/migrations/` (SQL-файлы + runner).
- JWT подписывается `JWT_SECRET`, ttl через `JWT_EXPIRES_IN`.
- Пароли хранятся только как bcrypt hash (`password_hash`), никогда в логах.
- Frontend: RTK Query GraphQL endpoints + auth slice в Redux.
- Question bank остаётся source of truth для интервью и не смешивается с auth-данными.

## Зависимости от предыдущих блоков

- Блок `01-🟡-backend-foundation`: DatabaseModule, migration runner, GraphQL foundation.
- Блок `02-✅-database-design`: design docs `docs/database/schemas/auth-company.md` — схема `users`, `companies`, `company_memberships` должна быть спроектирована до реализации SQL migrations.
- Блок `03-✅-frontend-foundation`: Router, RTK Query baseApi, graphqlBaseQuery.
- ENV: `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`.

## Ожидаемый результат после завершения блока

Пользователь регистрируется и логинится через GraphQL, получает JWT, видит защищённый dashboard, `me` возвращает текущего пользователя и компанию, а backend отклоняет защищённые запросы без валидного токена.
