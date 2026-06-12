# ✅ TASK-04.3 — Хэширование паролей через bcrypt

Status: [x] done  
Priority: High  
Parent block: `04-✅-auth-company`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Подключить безопасное хэширование паролей при регистрации и проверку bcrypt hash при логине.

## Context

После блоков 01–03 уже есть каркас backend, спроектированная схема БД (`02-✅-database-design`) и frontend foundation. Теперь нужна безопасная авторизация, чтобы рекрутер работал только в своей компании, а dashboard и mutation-операции защищались единым guard-слоем. Токен и current user станут базой для блоков 05–08.

Эта подзадача — часть блока `04-✅-auth-company` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Хэширование паролей через bcrypt» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- SSO/OAuth, magic link, MFA, password reset по email.
- Refresh token rotation и хранение сессий в Redis.
- Ролевая матрица admin/recruiter/interviewer (минимум owner/member).
- UI управления компанией и пользователями (будет в dashboard блоках).
- Публичный candidate flow (блок 06).

## Files / Folders Allowed

- `backend/src/modules/auth/password.service.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/.env.example`
- `backend/src/common/config/env.schema.ts`

## Requirements

1. Пакет `bcrypt` (или `bcryptjs`) + типы.
2. ENV `BCRYPT_SALT_ROUNDS` (default 12).
3. При register хранить только `password_hash`.
4. При login использовать `bcrypt.compare`.
5. Логирование не должно содержать plaintext пароль.

## Step-by-step Plan

1. Установить пакет bcrypt.
2. Создать `PasswordService` с `hash()` и `verify()`.
3. Интегрировать сервис в `AuthService.register/login`.
4. Обновить Joi schema и `.env.example`.
5. Проверить, что в БД записывается hash с префиксом `$2`.

## Acceptance Criteria

- Пароли в БД не хранятся в открытом виде.
- Неверный пароль отклоняется единообразной ошибкой.
- Salt rounds настраивается через env.

## Checks

```bash
cd backend && npm run build
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SELECT email,password_hash FROM users LIMIT 1;'
```

## Completion Notes

**Сделано:** bcrypt hash при регистрации и verify при login; salt rounds из env.

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `cd backend && npm run build` | exit 0 | OK |
| `docker compose exec mysql ... SELECT email,password_hash FROM users LIMIT 1;` | hash с префиксом `$2` | см. Checks при поднятом MySQL |

