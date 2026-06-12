# 01-🟡-backend-foundation — Фундамент backend

## Цель блока

Поднять production-ready каркас NestJS backend: GraphQL, MySQL, Redis, SQL-миграции, Docker Compose и базовая observability — единый фундамент для auth, question bank и interview.

## Контекст

AI Interviewer Platform — B2B SaaS: рекрутер создаёт интервью из банка вопросов, кандидат проходит text/voice/video flow, AI оценивает ответы по checkpoint. Backend — единая точка правды. Архитектура повторяет `captcha-back`: NestJS modules, raw SQL migrations, отдельный `migrate` service, таблица `schema_migrations`. Эталон для сравнения: `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`.

## Что входит в этот блок

- Инициализация NestJS в `backend/` с модульной структурой (`src/modules/`, `src/common/`).
- Конфигурация через `@nestjs/config` + Joi-валидация env при старте.
- GraphQL (code-first, Apollo) на `/graphql` — основной бизнес API.
- MySQL через `mysql2` pool / DatabaseModule (raw SQL, без ORM).
- Redis через `ioredis` — health check и client для cache/locks.
- SQL migration runner в `backend/migrations/` + bootstrap-миграция `schema_migrations`.
- Dockerfile backend + `docker-compose.yml` (mysql, redis, backend, migrate).
- REST `GET /health` для мониторинга.
- Structured logging (pino/winston) + глобальный exception filter.
- `backend/README.md` и `backend/.env.example` с полным списком переменных.

## Что НЕ входит в этот блок

- Auth, users, companies (блок 04).
- Question bank schema/API (блок 05).
- Interview entities и public flow (блок 06).
- AI evaluation (блок 07).
- Frontend (блок 03).
- Production deploy и CI/CD (блок 11), кроме локального docker-compose.

## Важные архитектурные решения

- Monorepo: `backend/` NestJS, `frontend/` отдельно.
- Эталон backend-структуры: `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`; перед значимыми backend-решениями сверяться с ним.
- GraphQL — основной API; REST только для health, upload, webhooks.
- MySQL — primary datastore; Redis — cache, rate-limit, session задел.
- Миграции — только `.sql` файлы + runner; таблица `schema_migrations(version, applied_at)`.
- Отдельный Docker service `migrate` запускает runner до старта backend.
- 12-factor config: секреты только через env, никогда в коде.

## Зависимости от предыдущих блоков

- Блок `00-✅-project-setup` — структура `docs/tasks/`.
- Node.js 20 LTS, npm, Docker Desktop для локальной разработки.

## Связь со следующим блоком

- Блок `02-⬜-database-design` проектирует доменные схемы **после** того, как этот блок создаст migration runner и `schema_migrations`. Реальные business migrations создаются в feature-блоках 04+ по design docs из блока 02.

## Ожидаемый результат после завершения блока

Локально `docker compose up` поднимает mysql, redis, migrate, backend. `GET /health` → 200, GraphQL Playground на `/graphql`, миграции применяются идемпотентно, README описывает все env.
