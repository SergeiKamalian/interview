# 00 — Project Setup Tasks

Overall status: ✅ done

---

## Subtasks

### TASK-00.1 — Create task system structure

Status: [x] done  
File:

```txt
subtasks/001-✅-create-task-system-structure.md
```

Goal:

Создать новую структуру задач в `docs/tasks/list/` с README, STATUS, CURSOR_RULES и folder-based блоками.

---

### TASK-00.2 — Create main task block folders

Status: [x] done  
File:

```txt
subtasks/002-✅-create-main-task-block-folders.md
```

Goal:

Создать папки блоков `01`–`11` с README.md, TASKS.md и subtasks/.

---

### TASK-00.3 — Finalize project setup status

Status: [x] done  
File:

```txt
subtasks/003-✅-finalize-project-setup-status.md
```

Goal:

Закрыть setup-блок и подготовить переход к `01-🟡-backend-foundation`.

---

## Completion rule

Большой блок `00-project-setup` считается completed только когда:

- `TASK-00.1` done;
- `TASK-00.2` done;
- `TASK-00.3` done.

Папка переименована:

```bash
mv "00-🟡-project-setup" "00-✅-project-setup"
```
