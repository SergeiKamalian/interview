# Project Status

Этот файл показывает, где мы сейчас находимся в проекте.

---

## Emoji-статусы

```txt
⬜ todo
🟡 in progress
✅ done
⛔ blocked
```

---

## Внутренние статусы

```txt
[ ] todo
[~] in progress
[x] done
[!] blocked
```

---

## Naming Rules

### Большие task-блоки

```txt
[number]-[emoji-status]-[block-name]/
```

Пример:

```txt
00-🟡-project-setup/
01-🟡-backend-foundation/
```

### Subtask-файлы

```txt
[three-digit-number]-[emoji-status]-[subtask-name].md
```

Пример:

```txt
001-🟡-create-task-system-structure.md
002-⬜-create-main-task-block-folders.md
003-⬜-finalize-project-setup-status.md
```

---

## Current Active Block

Active block:

```txt
docs/tasks/list/05-⬜-question-bank/
```

Block status:

```txt
⬜ todo
```

Block title:

```txt
Question Bank
```

---

## Current Active Subtask

Active subtask ID:

```txt
Нет активного subtask — блок 05 ещё не начат.
```

Last completed subtask:

```txt
TASK-04.10 — Add current user state
```

Next recommended subtask:

```txt
TASK-05.1
```

Next subtask file:

```txt
docs/tasks/list/05-⬜-question-bank/subtasks/001-⬜-add-question-bank-database-tables.md
```

Last updated:

```txt
2026-06-12
```

---

## Done

- [x] Created `docs/PROJECT.md`
- [x] Created `docs/DECISIONS.md`
- [x] Decided to write docs in Russian
- [x] Decided to use GraphQL as main business API
- [x] Decided to use RTK Query with GraphQL on frontend
- [x] Decided that AI is not source of truth
- [x] Decided that question bank is source of truth
- [x] Decided to organize tasks as folders inside `docs/tasks/list/`
- [x] Decided to use emoji-statuses in task folder/file names
- [x] Decided to put ordering number before emoji in folder/file names
- [x] Generated detailed task planning files for blocks `01`–`11` (`README.md`, `TASKS.md`, subtask files in `docs/tasks/list/`)
- [x] Added block `02-⬜-database-design` (SQL-first design, 11 subtasks) and renumbered blocks `02`–`10` → `03`–`11`
- [x] Created `.cursor/rules/` (read context, task workflow, architecture)
- [x] `TASK-00.1` — Create task system structure
- [x] `TASK-00.2` — Create main task block folders
- [x] `TASK-00.3` — Finalize project setup status
- [x] Block `00-✅-project-setup` completed
- [x] `TASK-01.1` — Create NestJS app structure
- [x] `TASK-01.2` — Base config and env validation
- [x] `TASK-01.3` — Health endpoint for monitoring
- [x] `TASK-01.4` — GraphQL foundation (Apollo)
- [x] `TASK-01.5` — MySQL connection module
- [x] `TASK-01.7` — SQL migration runner
- [x] `TASK-01.8` — schema_migrations table
- [x] `TASK-01.6` — Redis connection module
- [x] `TASK-01.9` — Dockerfile for backend
- [x] `TASK-01.10` — docker-compose services
- [x] `TASK-01.11` — Base logging and error handling
- [x] `TASK-01.12` — Backend README and env examples
- [x] Block `01-✅-backend-foundation` completed
- [x] `TASK-02.1` — Database design: define conventions
- [x] `TASK-02.2` — Database design: define migration system
- [x] `TASK-02.3` — Database design: auth & company schema
- [x] `TASK-02.4` — Database design: question bank schema
- [x] `TASK-02.5` — Database design: interview core schema
- [x] `TASK-02.6` — Database design: AI evaluation schema
- [x] `TASK-02.7` — Database design: media storage schema
- [x] `TASK-02.8` — Database design: analytics & AI cost schema
- [x] `TASK-02.9` — Database design: ATS integrations schema
- [x] `TASK-02.10` — Database design: indexes & performance catalog
- [x] `TASK-02.11` — Database design: implementation plan
- [x] Block `02-✅-database-design` completed (migrations 001–010 applied to MySQL)
- [x] `TASK-03.1` — Create Vite React TypeScript app
- [x] `TASK-03.2` — Add Tailwind CSS
- [x] `TASK-03.3` — Add React Router
- [x] `TASK-03.4` — Add Redux Toolkit store
- [x] `TASK-03.5` — Add RTK Query base setup
- [x] `TASK-03.6` — Add GraphQL baseQuery for RTK Query
- [x] `TASK-03.7` — Add FSD-like folder structure
- [x] `TASK-03.8` — Add base layouts
- [x] `TASK-03.9` — Add frontend env config
- [x] `TASK-03.10` — Add basic UI primitives
- [x] Block `03-✅-frontend-foundation` completed
- [x] `TASK-04.1` — Auth DB tables (verified migrations 002–004 from block 02)
- [x] `TASK-04.2` — Backend AuthModule + repositories + DTO
- [x] `TASK-04.3` — bcrypt password hashing
- [x] `TASK-04.4` — JWT access token
- [x] `TASK-04.5` — GraphQL register/login/me
- [x] `TASK-04.6` — Company creation on register (owner membership)
- [x] `TASK-04.7` — GqlAuthGuard + @CurrentUser()
- [x] `TASK-04.8` — Frontend login/register forms
- [x] `TASK-04.9` — Protected dashboard routes
- [x] `TASK-04.10` — currentUser state + JWT in GraphQL headers
- [x] Block `04-✅-auth-company` completed

---

## In Progress

Block `05-⬜-question-bank` — следующий блок (ещё не начат).

---

## Next

- [ ] `TASK-04.1` — Add users & companies database tables
  - File: `docs/tasks/list/04-⬜-auth-company/subtasks/001-⬜-add-users-companies-database-tables.md`

---

## Blocked

No blocked tasks.

---

## Expected Task Structure

```txt
docs/tasks/
  README.md
  STATUS.md
  CURSOR_RULES.md
  list/
    00-✅-project-setup/
      README.md
      TASKS.md
      subtasks/
        001-✅-create-task-system-structure.md
        002-✅-create-main-task-block-folders.md
        003-✅-finalize-project-setup-status.md

    01-✅-backend-foundation/
      README.md
      TASKS.md
      subtasks/
        001-✅-create-nestjs-app-structure.md
        ...
        012-✅-add-backend-readme-env-examples.md

    02-✅-database-design/
      README.md
      TASKS.md
      subtasks/
        001-✅-define-database-conventions.md
        ...
        011-✅-prepare-database-implementation-plan.md

    03-✅-frontend-foundation/
      README.md
      TASKS.md
      subtasks/
        001-✅-create-vite-react-typescript-app.md
        ...
        010-✅-add-basic-ui-primitives.md

    04-✅-auth-company/
      README.md
      TASKS.md
      subtasks/
        001-✅-add-users-companies-database-tables.md
        ...
        010-✅-add-current-user-state.md

    05-⬜-question-bank/
      README.md
      TASKS.md
      subtasks/

    06-⬜-interview-core/
      README.md
      TASKS.md
      subtasks/

    07-⬜-ai-evaluation/
      README.md
      TASKS.md
      subtasks/

    08-⬜-dashboard-analytics/
      README.md
      TASKS.md
      subtasks/

    09-⬜-voice-video/
      README.md
      TASKS.md
      subtasks/

    10-⬜-ats-integrations/
      README.md
      TASKS.md
      subtasks/

    11-⬜-deployment/
      README.md
      TASKS.md
      subtasks/
```

---

## Update Rules

Когда начинается subtask:

1. Его файл должен иметь emoji `🟡`.
2. Внутри файла должен быть статус `[~] in progress`.
3. `STATUS.md` должен указывать этот subtask как активный.

Когда subtask завершается:

1. Внутри subtask-файла поставить `[x] done`.
2. Переименовать файл с `🟡` на `✅`.
3. Обновить `TASKS.md` внутри большого блока.
4. Обновить `STATUS.md`.
5. Следующий subtask можно переименовать с `⬜` на `🟡`, только когда реально начинается работа над ним.

Когда все subtasks внутри большого блока завершены:

1. Все subtask-файлы должны быть `✅`.
2. В `TASKS.md` блока все пункты должны быть `[x]`.
3. Папка блока переименовывается с `🟡` на `✅`.
4. `STATUS.md` переключается на следующий большой блок.
