# ✅ TASK-00.2 — Create main task block folders

Status: [x] done  
Priority: High  
Parent block: `00-🟡-project-setup`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать placeholder-папки для всех будущих больших task-блоков внутри:

```txt
docs/tasks/list/
```

---

## Scope

Создать папки:

```txt
docs/tasks/list/01-🟡-backend-foundation/
docs/tasks/list/02-⬜-database-design/
docs/tasks/list/03-⬜-frontend-foundation/
docs/tasks/list/04-⬜-auth-company/
docs/tasks/list/05-⬜-question-bank/
docs/tasks/list/06-⬜-interview-core/
docs/tasks/list/07-⬜-ai-evaluation/
docs/tasks/list/08-⬜-dashboard-analytics/
docs/tasks/list/09-⬜-voice-video/
docs/tasks/list/10-⬜-ats-integrations/
docs/tasks/list/11-⬜-deployment/
```

Внутри каждой папки создать:

```txt
README.md
TASKS.md
subtasks/
```

---

## Out of Scope

Не заполнять эти блоки подробно.

Не писать backend/frontend код.

Не устанавливать пакеты.

---

## Placeholder README format

Каждый `README.md` должен иметь минимальный вид:

```md
# NN-⬜ — Block Title

Этот task-блок будет подробно описан позже после обсуждения.

## Status

⬜ todo

## Notes

Подробные задачи будут добавлены отдельно.
```

---

## Placeholder TASKS format

Каждый `TASKS.md` должен иметь минимальный вид:

```md
# NN — Block Title Tasks

Overall status: ⬜ todo

## Subtasks

TODO: подзадачи будут добавлены после обсуждения блока.
```

---

## Acceptance Criteria

Задача выполнена, если все 10 placeholder-блоков созданы и внутри каждого есть:

- `README.md`;
- `TASKS.md`;
- `subtasks/`.

---

## Checks

```bash
ls docs/tasks/list
ls docs/tasks/list/01-🟡-backend-foundation
```

---

## Completion Notes

Выполнено 2026-06-12.

- Созданы все 11 блоков `01`–`11` с `README.md`, `TASKS.md`, `subtasks/`.
- Блоки содержат детальные subtasks (не только placeholders).
- Блок `02-⬜-database-design` добавлен и вставлен в порядок после `01`.
