# Tasks

Этот раздел хранит задачи проекта.

Задачи организованы не одним большим файлом, а папками по большим блокам.

---

## Главная структура

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

    02-✅-database-design/
      README.md
      TASKS.md
      subtasks/

    03-✅-frontend-foundation/
      README.md
      TASKS.md
      subtasks/

    04-⬜-auth-company/
    05-⬜-question-bank/
    06-⬜-interview-core/
    07-⬜-ai-evaluation/
    08-⬜-dashboard-analytics/
    09-⬜-voice-video/
    10-⬜-ats-integrations/
    11-⬜-deployment/
```

---

## Рекомендуемый порядок блоков

```txt
00 — project-setup
01 — backend-foundation      (NestJS, MySQL, Redis, GraphQL, migration runner)
02 — database-design         (SQL schema + migrations 001–010)
03 — frontend-foundation     (React Vite RTK Query GraphQL)
04 — auth-company
05 — question-bank           (source of truth)
06 — interview-core
07 — ai-evaluation           (checkpoint-based JSON)
08 — dashboard-analytics
09 — voice-video
10 — ats-integrations
11 — deployment
```

Важно: design docs в `docs/database/` и SQL migrations — source of truth для feature-блоков 04+.

---

## Эталонные проекты

| Часть | Проект | Путь |
|-------|--------|------|
| Backend | `captcha-back` | `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back` |
| Frontend | `captcha-panel` | `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-panel` |

Подробнее: `docs/DECISIONS.md`, `.cursor/rules/architecture-constraints.mdc`.

---

## Emoji-статусы

Статус ставится:

1. На папку большого блока.
2. На каждый subtask-файл.

```txt
⬜ todo
🟡 in progress
✅ done
⛔ blocked
```

---

## Формат названий папок больших блоков

Большой task-блок называется так:

```txt
[number]-[emoji-status]-[block-name]/
```

Примеры:

```txt
00-🟡-project-setup/
01-🟡-backend-foundation/
02-⬜-database-design/
03-⬜-frontend-foundation/
04-✅-auth-company/
```

Когда статус большого блока меняется, папку нужно переименовать.

Пример:

```bash
mv "docs/tasks/list/00-🟡-project-setup" "docs/tasks/list/00-✅-project-setup"
```

---

## Формат названий subtask-файлов

Subtask-файл называется так:

```txt
[three-digit-number]-[emoji-status]-[subtask-name].md
```

Примеры:

```txt
001-🟡-create-task-system-structure.md
002-⬜-define-database-conventions.md
003-✅-finalize-project-setup-status.md
004-⛔-some-blocked-task.md
```

Почему номер первым:

- файлы всегда сортируются правильно;
- визуально видно порядок;
- emoji всё равно показывает статус;
- меньше хаоса в терминале и файловом дереве.

---

## Внутренние статусы

Внутри `TASKS.md` и subtask-файлов используем:

```txt
[ ] todo
[~] in progress
[x] done
[!] blocked
```

---

## Как работает большой блок

Каждый большой блок — это отдельная папка:

```txt
docs/tasks/list/00-✅-project-setup/
```

Внутри:

```txt
README.md
TASKS.md
subtasks/
```

### `README.md`

Описание блока:

- цель;
- контекст;
- что входит;
- что не входит;
- важные правила.

### `TASKS.md`

Список всех подзадач этого блока:

- `TASK-00.1`
- `TASK-00.2`
- `TASK-00.3`

Когда все подзадачи завершены, папка большого блока переименовывается из `🟡` в `✅`.

### `subtasks/`

Каждая маленькая задача отдельно, чтобы Cursor работал только над одной задачей за раз.

---

## Правило работы

Cursor получает:

1. `docs/PROJECT.md`
2. `docs/DECISIONS.md`
3. `docs/tasks/README.md`
4. `docs/tasks/STATUS.md`
5. `docs/tasks/CURSOR_RULES.md`
6. `README.md` активного большого блока
7. `TASKS.md` активного большого блока
8. один конкретный subtask-файл

Cursor НЕ должен выполнять весь блок сразу.

```txt
Один prompt = один subtask.
```

---

## Текущий активный блок

```txt
Setup завершён (00-✅-project-setup).
```

Следующий блок (не начат):

```txt
docs/tasks/list/01-🟡-backend-foundation/
```

Блок в работе. Следующая подзадача:

```txt
docs/tasks/list/01-🟡-backend-foundation/subtasks/002-⬜-add-base-config-env-validation.md
```
