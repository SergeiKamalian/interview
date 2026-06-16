# Cursor Rules

Правила для Cursor при работе с проектом.

---

## Главное правило

```txt
Один prompt = один subtask.
```

Cursor не должен делать весь большой блок сразу.

---

## Что Cursor должен читать перед работой

Перед выполнением любого subtask Cursor должен открыть:

1. `docs/PROJECT.md`
2. `docs/DECISIONS.md`
3. `docs/tasks/README.md`
4. `docs/tasks/STATUS.md`
5. `docs/tasks/CURSOR_RULES.md`
6. `README.md` активного task-блока
7. `TASKS.md` активного task-блока
8. конкретный subtask-файл

Пример для текущего этапа:

```txt
docs/tasks/list/01-🟡-backend-foundation/README.md
docs/tasks/list/01-🟡-backend-foundation/TASKS.md
docs/tasks/list/01-🟡-backend-foundation/subtasks/002-⬜-add-base-config-env-validation.md
```

---

## Структура задач

Большие задачи хранятся папками:

```txt
docs/tasks/list/00-✅-project-setup/
docs/tasks/list/01-🟡-backend-foundation/
docs/tasks/list/02-⬜-database-design/
docs/tasks/list/03-⬜-frontend-foundation/
```

Внутри каждой папки:

```txt
README.md
TASKS.md
subtasks/
```

---

## Emoji-статусы

```txt
⬜ todo
🟡 in progress
✅ done
⛔ blocked
```

Emoji ставится:

- на папку большого блока;
- на файл каждой подзадачи.

---

## Внутренние статусы

Внутри файлов используем:

```txt
[ ] todo
[~] in progress
[x] done
[!] blocked
```

---

## Naming Rules

### Большие task-блоки

Формат:

```txt
[number]-[emoji-status]-[block-name]/
```

Примеры:

```txt
00-✅-project-setup/
01-🟡-backend-foundation/
02-⬜-database-design/
03-⬜-frontend-foundation/
04-⛔-auth-company/
```

### Subtask-файлы

Формат:

```txt
[three-digit-number]-[emoji-status]-[subtask-name].md
```

Примеры:

```txt
001-🟡-create-task-system-structure.md
002-⬜-create-main-task-block-folders.md
003-✅-finalize-project-setup-status.md
004-⛔-some-blocked-task.md
```

Важно:

Номер всегда идёт первым.  
Emoji всегда идёт после номера.  
Так файлы сортируются нормально и статус всё равно виден.

---

## Правила переименования

Когда subtask начинается:

```bash
mv "002-⬜-create-main-task-block-folders.md" "002-🟡-create-main-task-block-folders.md"
```

Когда subtask завершён:

```bash
mv "002-🟡-create-main-task-block-folders.md" "002-✅-create-main-task-block-folders.md"
```

Когда subtask заблокирован:

```bash
mv "002-🟡-create-main-task-block-folders.md" "002-⛔-create-main-task-block-folders.md"
```

Когда все subtasks внутри большого блока done:

```bash
mv "00-🟡-project-setup" "00-✅-project-setup"
```

После каждого переименования нужно обновить:

- `docs/tasks/STATUS.md`;
- `TASKS.md` внутри активного блока;
- `docs/tasks/README.md`, если там есть прямые ссылки на переименованные пути.

---

## Scope Rules

Cursor должен работать только в рамках текущего subtask.

Cursor НЕ должен:

- выполнять следующий subtask без команды;
- выполнять весь большой блок сразу;
- менять архитектуру без запроса;
- делать unrelated refactoring;
- устанавливать лишние пакеты;
- трогать frontend, если задача про backend;
- трогать backend, если задача про frontend;
- менять `PROJECT.md` или `DECISIONS.md` без отдельного запроса.

---

## Documentation Language Rules

Документация пишется на русском языке.

На английском остаются:

- названия файлов;
- названия папок;
- код;
- env variables;
- GraphQL types;
- database fields;
- endpoints;
- package names.

---

## Architecture Rules

Основные решения:

- backend внутри `backend/`;
- frontend внутри `frontend/`;
- tasks внутри `docs/tasks/list/`;
- backend похож на `captcha-back`;
- **эталон backend:** `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`;
- **эталон frontend:** `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-panel`;
- TypeScript imports в backend должны быть как в `captcha-back`: без `.js` suffix (`./app.module`, не `./app.module.js`);
- backend stack:
  - NestJS;
  - TypeScript;
  - MySQL;
  - Redis;
  - Docker Compose;
  - SQL migrations;
  - GraphQL API;
  - REST для файлов, health, webhooks;
- frontend stack:
  - React;
  - Vite;
  - TypeScript;
  - Tailwind CSS;
  - Redux Toolkit;
  - RTK Query;
  - GraphQL;
  - React Router;
  - FSD-like structure;
- frontend по образцу `captcha-panel` (структура, routing, UI); эталон: `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-panel`;
- data layer frontend — RTK Query + GraphQL (не Effector/axios из эталона);
- AI не источник правды;
- источник правды — question bank, ideal answers, checkpoints.

---

## Database Design Rules

Проектирование и реализация базы данных — **два разных этапа**.

### Блок `02-✅-database-design`

- Создаёт только документацию в `docs/database/`.
- **Не создаёт** реальные `.sql` files в `backend/migrations/`.
- **Не меняет** migration runner (это блок 01).

### SQL-first подход (обязательно)

- MySQL — единственная primary database.
- Миграции — raw SQL files + migration runner + таблица `schema_migrations`.
- Explicit FK, indexes, unique constraints в DDL design.
- Naming conventions: snake_case tables/columns, documented in `docs/database/CONVENTIONS.md`.
- Архитектура как в `captcha-back`: отдельный Docker service `migrate`.

### Запрещено

- Prisma (migrations, schema, client).
- TypeORM entities / auto-sync schema.
- MongoDB, PostgreSQL.
- Auto-generated ORM schema как source of truth.
- Создание business tables «на ходу» в feature-блоке без design doc из блока 02.

### Порядок работы

```txt
01 backend-foundation  → migration runner infrastructure
02 database-design     → design docs (schemas, indexes, implementation plan)
04+ feature blocks      → реальные SQL migrations по design docs
```

Feature-блоки (`04-auth-company`, `05-question-bank`, `06-interview-core`, `07-ai-evaluation`, `09-adaptive-ai-interview` для live evidence/follow-ups, `10-voice` и `11-video` для media metadata, `12-ats-integrations` для integration logs) **зависят** от соответствующих design docs в `docs/database/schemas/`.

Перед созданием SQL migration в feature-блоке Cursor должен проверить, что design doc из блока 02 существует и согласован с `CONVENTIONS.md`.

---

## Verification Rules

Перед закрытием **любого** subtask Cursor обязан проверить результат всеми доступными способами, подходящими под тип задачи.

### Минимум для любого subtask

- `build` / `lint` / `test` в затронутом пакете
- smoke-check реального поведения, а не только компиляции

### По типу задачи

| Тип | Как проверять |
|-----|---------------|
| REST API / health | `curl`, `httpie`, supertest, browser |
| GraphQL | Playground, `curl` POST `/graphql` |
| Config / env | старт с валидным и невалидным env |
| MySQL / Redis | connect/ping, migration runner |
| Frontend | `npm run dev`, route render, network tab |
| Docker | `docker compose up`, health checks |

### Правило закрытия

Subtask **нельзя** помечать `[x] done`, если проверка не была выполнена или упала.

В Completion Notes обязательно указать:
- команды/запросы
- ожидаемый результат
- фактический результат

---

## Completion Rules

После выполнения subtask Cursor должен:

1. Выполнить verification checks из раздела выше.
2. Обновить subtask-файл.
3. Поставить статус `[x] done`.
4. Добавить completion notes с результатами проверок.
5. Переименовать subtask-файл на `✅`.
6. Обновить `TASKS.md` блока.
7. Обновить `docs/tasks/STATUS.md`.
8. Написать список изменённых файлов.
9. Написать, как повторить проверку.

---

## If Something Is Unclear

Если Cursor не уверен:

- какой subtask активный;
- какую папку трогать;
- можно ли менять архитектуру;
- можно ли ставить пакет;
- какой файл переименовывать;
- какой emoji-статус ставить;

нужно остановиться и спросить.

Не угадывать.
