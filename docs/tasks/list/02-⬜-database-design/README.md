# 02-⬜-database-design — Проектирование базы данных

## Цель блока

Спроектировать полную SQL-first схему MySQL для AI Interviewer Platform **до** реализации feature-блоков: conventions, migration policy, доменные ER/DDL design docs, indexes и implementation plan.

## Контекст

Продукт хранит много связанных доменов: companies, question bank (source of truth), interviews, AI evaluations, media metadata, analytics, ATS logs. Если проектировать таблицы «на ходу» в каждом feature-блоке, схема быстро станет несогласованной. Отдельный design-блок фиксирует единую модель данных по аналогии с `captcha-back`: raw SQL, explicit constraints, migration runner, `schema_migrations`.

## Почему database design — отдельный блок

- **Единый source of truth для схемы** — все feature-блоки ссылаются на design docs, а не придумывают таблицы заново.
- **Порядок миграций** — FK-зависимости требуют строгой последовательности: auth → question bank → interview → AI → media → ATS.
- **Question bank как продуктовый source of truth** — checkpoints, weights и examples должны быть спроектированы до AI evaluation и interview snapshot.
- **Разделение design и implementation** — этот блок создаёт только документацию в `docs/database/`, не `.sql` migration files.
- **Снижение риска перед backend feature work** — блок 01 даёт runner, блок 02 даёт что именно мигрировать.

## Почему SQL-first подход

- Полный контроль над DDL, indexes и FK как в `captcha-back`.
- Прозрачные code review миграций (plain SQL в git).
- Нет drift между ORM schema и реальной БД.
- Предсказуемый `migrate` service в Docker Compose.

## Почему MySQL

- Согласовано с `docs/DECISIONS.md` и архитектурой `captcha-back`.
- Подходит для relational multi-tenant B2B данных, transactions, JOIN-аналитики.
- Команда уже знакома с MySQL + raw SQL migrations.

## Почему без Prisma / TypeORM

- Prisma и TypeORM создают auto-generated schema и скрывают DDL.
- Проект явно выбрал SQL files + migration runner + `schema_migrations`.
- ORM усложняет review constraints/indexes и contradicts captcha-back approach.
- Доступ к данным в backend — через `mysql2` pool / DatabaseService с raw SQL.

## Связь с архитектурой captcha-back

- SQL migration files в `backend/migrations/` (создаются позже, не в этом блоке).
- Таблица `schema_migrations(version, applied_at)`.
- Отдельный Docker service `migrate`.
- Explicit FK, indexes, naming conventions.
- NestJS DatabaseModule без ORM.

## Что входит в этот блок

- `docs/database/CONVENTIONS.md` — naming, types, multi-tenant rules.
- `docs/database/MIGRATIONS.md` — migration policy и runner integration.
- `docs/database/schemas/*.md` — доменные схемы: auth, question bank, interview, AI, media, analytics, ATS.
- `docs/database/INDEXES_AND_PERFORMANCE.md` — сводный каталог indexes/FK.
- `docs/database/IMPLEMENTATION_PLAN.md` — порядок будущих migrations.
- 11 subtasks в `subtasks/` — по одной исполняемой design-задаче.

## Что НЕ входит в этот блок

- Реальные `.sql` files в `backend/migrations/`.
- Изменения migration runner (блок 01).
- NestJS modules, GraphQL resolvers, services.
- Frontend код.
- Prisma, TypeORM, MongoDB, PostgreSQL.
- Production deploy (блок 11).

## Важные архитектурные решения

- MySQL 8+, charset `utf8mb4`.
- SQL-first, raw migrations, `schema_migrations` tracking.
- Multi-tenant: `company_id` на company-scoped таблицах.
- Question bank normalized schema; checkpoints не в AI prompts only.
- Interview question snapshot при создании интервью.
- Media: metadata in MySQL, binaries in object storage.
- AI evaluation: raw JSON + normalized checkpoint_results.

## Зависимости от предыдущих блоков

- Блок `01-🟡-backend-foundation` — MySQL connection, migration runner infrastructure (design ссылается на runner, но не меняет его).
- Блок `00-✅-project-setup` — task system.

## Ожидаемый результат после завершения блока

В `docs/database/` полный комплект design-документов: conventions, migration policy, 7 доменных схем, index catalog, implementation plan. Feature-блоки 04–10 могут создавать SQL migrations строго по этому плану. Реальных migration files ещё нет.
