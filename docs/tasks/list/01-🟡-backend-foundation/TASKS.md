# 01 — Фундамент backend Tasks

Overall status: 🟡 in progress

---

## Subtasks

### TASK-01.1 — Создание структуры NestJS-приложения

Status: [x] done  
File:

```txt
subtasks/001-✅-create-nestjs-app-structure.md
```

Goal:

Создать NestJS-проект в `backend/` с модульной структурой, npm scripts и entrypoint `main.ts`, готовый к подключению Config, GraphQL и Database модулей.

---

### TASK-01.2 — Базовая конфигурация и валидация env

Status: [x] done  
File:

```txt
subtasks/002-✅-add-base-config-env-validation.md
```

Goal:

Подключить `@nestjs/config` с Joi-схемой: приложение не стартует при невалидных или отсутствующих обязательных env.

---

### TASK-01.3 — Health endpoint для мониторинга

Status: [x] done  
File:

```txt
subtasks/003-✅-add-health-endpoint.md
```

Goal:

Добавить REST `GET /health` с проверкой uptime и версии приложения; задел для DB/Redis checks в следующих subtasks.

---

### TASK-01.4 — GraphQL-фундамент (Apollo)

Status: [x] done  
File:

```txt
subtasks/004-✅-add-graphql-foundation.md
```

Goal:

Настроить Apollo GraphQL code-first на `/graphql` с auto schema, playground в dev и тестовым query `hello`.

---

### TASK-01.5 — Модуль подключения MySQL

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-mysql-connection-module.md
```

Goal:

Создать `DatabaseModule` с `mysql2` connection pool, health-проверкой и injectable `DatabaseService` для raw SQL запросов.

---

### TASK-01.6 — Модуль подключения Redis

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-redis-connection-module.md
```

Goal:

Создать `RedisModule` с `ioredis` client, ping при старте и статусом в health endpoint.

---

### TASK-01.7 — SQL migration runner

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-sql-migration-runner.md
```

Goal:

Реализовать CLI migration runner: читает `backend/migrations/*.sql`, применяет в порядке версии, логирует результат.

---

### TASK-01.8 — Таблица schema_migrations

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-schema-migrations-table.md
```

Goal:

Создать bootstrap-миграцию `001_create_schema_migrations.sql` с таблицей учёта применённых миграций.

---

### TASK-01.9 — Dockerfile для backend

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-dockerfile.md
```

Goal:

Создать multi-stage `backend/Dockerfile` для production-like сборки NestJS приложения.

---

### TASK-01.10 — docker-compose сервисы

Status: [ ] todo  
File:

```txt
subtasks/010-⬜-add-docker-compose-services.md
```

Goal:

Создать корневой `docker-compose.yml` с сервисами mysql, redis, migrate, backend и volume для данных.

---

### TASK-01.11 — Базовое логирование и обработка ошибок

Status: [ ] todo  
File:

```txt
subtasks/011-⬜-add-base-logging-error-handling.md
```

Goal:

Добавить structured logging и глобальные фильтры исключений для REST и GraphQL с единым JSON-форматом ошибок.

---

### TASK-01.12 — README backend и примеры .env

Status: [ ] todo  
File:

```txt
subtasks/012-⬜-add-backend-readme-env-examples.md
```

Goal:

Написать `backend/README.md` с инструкциями локального запуска, docker-compose, migrate и полным списком env.

---

## Completion rule

Блок `01-🟡-backend-foundation` считается completed только когда все subtasks `01.1`–`01.12` имеют status `[x] done`; папка переименована в `01-✅-backend-foundation`.
