# ✅ TASK-00.1 — Create task system structure

Status: [x] done  
Priority: High  
Parent block: `00-🟡-project-setup`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать новую структуру задач, где большие задачи являются папками внутри:

```txt
docs/tasks/list/
```

А подзадачи лежат внутри:

```txt
subtasks/
```

---

## Context

Мы решили не хранить все задачи в одном большом файле.

Также мы решили не смешивать информацию и конкретные исполняемые задачи.

Новая структура:

```txt
docs/tasks/
  README.md
  STATUS.md
  CURSOR_RULES.md
  list/
    00-🟡-project-setup/
      README.md
      TASKS.md
      subtasks/
        001-🟡-create-task-system-structure.md
        002-⬜-create-main-task-block-folders.md
        003-⬜-finalize-project-setup-status.md
```

---

## Scope

В рамках этой подзадачи нужно создать/проверить:

```txt
docs/tasks/README.md
docs/tasks/STATUS.md
docs/tasks/CURSOR_RULES.md
docs/tasks/list/
docs/tasks/list/00-🟡-project-setup/
docs/tasks/list/00-🟡-project-setup/README.md
docs/tasks/list/00-🟡-project-setup/TASKS.md
docs/tasks/list/00-🟡-project-setup/subtasks/
docs/tasks/list/00-🟡-project-setup/subtasks/001-🟡-create-task-system-structure.md
```

---

## Out of Scope

Не создавать backend.

Не создавать frontend.

Не устанавливать пакеты.

Не писать application code.

Не создавать остальные task-блоки, кроме `00-project-setup`.

Остальные task-блоки будут созданы в `TASK-00.2`.

---

## Requirements

### Requirement 1 — Create `docs/tasks/list/`

Должна существовать папка:

```txt
docs/tasks/list/
```

---

### Requirement 2 — Create active task block folder

Должна существовать папка:

```txt
docs/tasks/list/00-🟡-project-setup/
```

---

### Requirement 3 — Create block docs

Внутри блока должны быть:

```txt
README.md
TASKS.md
subtasks/
```

---

### Requirement 4 — Keep docs separated from executable tasks

`README.md` внутри блока должен содержать информацию и контекст.

`TASKS.md` должен содержать список подзадач.

`subtasks/` должен содержать отдельные исполняемые подзадачи.

---

### Requirement 5 — Update status files

Должны быть обновлены:

```txt
docs/tasks/README.md
docs/tasks/STATUS.md
docs/tasks/CURSOR_RULES.md
```

Они должны описывать новую folder-based task structure.

---

## Acceptance Criteria

Подзадача выполнена, если:

- есть `docs/tasks/list/`;
- есть `docs/tasks/list/00-🟡-project-setup/`;
- есть `README.md` внутри `00-🟡-project-setup/`;
- есть `TASKS.md` внутри `00-🟡-project-setup/`;
- есть `subtasks/` внутри `00-🟡-project-setup/`;
- есть этот subtask-файл;
- `STATUS.md` показывает `TASK-00.1` как active;
- `CURSOR_RULES.md` говорит, что один prompt = один subtask;
- backend/frontend не тронуты.

---

## Checks

```bash
ls docs/tasks
ls docs/tasks/list
ls docs/tasks/list/00-🟡-project-setup
ls docs/tasks/list/00-🟡-project-setup/subtasks
```

Ожидаемо:

```txt
README.md
STATUS.md
CURSOR_RULES.md
list
```

```txt
00-🟡-project-setup
```

```txt
README.md
TASKS.md
subtasks
```

```txt
001-🟡-create-task-system-structure.md
002-⬜-create-main-task-block-folders.md
003-⬜-finalize-project-setup-status.md
```

---

## Completion Notes

Выполнено 2026-06-12.

- Создана folder-based структура `docs/tasks/list/`.
- Файлы `README.md`, `STATUS.md`, `CURSOR_RULES.md` на месте.
- Блок `00-🟡-project-setup` с README, TASKS, subtasks.
- Добавлены `.cursor/rules/` для автоматического чтения контекста.
- Backend/frontend не тронуты.
