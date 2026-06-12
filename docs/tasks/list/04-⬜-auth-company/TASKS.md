# 04 — Аутентификация и компании Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-04.1 — Таблицы users и companies в базе

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-users-companies-database-tables.md
```

Goal:

Добавить SQL-миграции для сущностей пользователей и компаний: `users`, `companies`, `company_memberships` с внешними ключами и индексами.

---

### TASK-04.2 — Базовый AuthModule в backend

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-backend-auth-module.md
```

Goal:

Создать модуль аутентификации в NestJS с сервисами для регистрации и логина, репозиториями raw SQL и DTO для GraphQL input.

---

### TASK-04.3 — Хэширование паролей через bcrypt

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-password-hashing.md
```

Goal:

Подключить безопасное хэширование паролей при регистрации и проверку bcrypt hash при логине.

---

### TASK-04.4 — JWT авторизация в backend

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-jwt-auth.md
```

Goal:

Реализовать выпуск и верификацию JWT access token для GraphQL запросов и встроить payload с `userId` и `companyId`.

---

### TASK-04.5 — GraphQL API для login/register/me

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-graphql-auth-mutations-queries.md
```

Goal:

Добавить GraphQL resolver для аутентификации: `register`, `login`, `me`, с типами ответа и обработкой ошибок.

---

### TASK-04.6 — Создание компании при регистрации

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-company-creation-on-register.md
```

Goal:

Реализовать бизнес-логику, где регистрация первого пользователя создаёт компанию и связывает пользователя как `owner` в `company_memberships`.

---

### TASK-04.7 — GraphQL auth guards и CurrentUser

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-auth-guards.md
```

Goal:

Добавить guard для GraphQL, извлечение JWT из заголовка и декоратор `@CurrentUser()` для получения пользователя в resolver.

---

### TASK-04.8 — Frontend формы login/register

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-frontend-login-register.md
```

Goal:

Реализовать страницы `/login` и `/register` с формами, GraphQL мутациями, обработкой ошибок и сохранением access token в client state.

---

### TASK-04.9 — Защищённые dashboard маршруты

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-protected-dashboard-routes.md
```

Goal:

Внедрить auth-aware router: доступ к `/dashboard` только для авторизованного пользователя, неавторизованный редиректится на `/login`.

---

### TASK-04.10 — Состояние текущего пользователя

Status: [ ] todo  
File:

```txt
subtasks/010-⬜-add-current-user-state.md
```

Goal:

Добавить инициализацию `currentUser` через query `me`, хранение профиля в Redux и подключение JWT в заголовки GraphQL запросов.

---

## Completion rule

Блок `04-⬜-auth-company` считается completed только когда все subtasks `04.1`–`04.10` имеют status `[x] done`; папка переименована в `03-✅-auth-company`.
