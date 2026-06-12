# ⬜ TASK-02.11 — Подготовить план реализации базы данных

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Собрать итоговый implementation plan: порядок SQL migrations, mapping subtasks feature-блоков → migration files, checklist перед стартом auth.

---

## Context

Design block завершается не кодом, а планом исполнения. Feature-блоки (04-10) будут создавать реальные migrations по этому плану.

---

## Scope

- Создать `docs/database/IMPLEMENTATION_PLAN.md`.
- Ordered migration roadmap: 001 bootstrap → auth → question bank → interview → AI → media → analytics views → ATS.
- Mapping: which block subtask creates which migration.
- Pre-implementation checklist for block 04 auth.
- Rollout notes: dev docker migrate → staging → prod.

---

## Out of Scope

- Execution of migrations.
- Code changes in backend modules.

---

## Files / Folders Allowed

```txt
docs/database/IMPLEMENTATION_PLAN.md
docs/database/README.md (index of all design docs)
```

---

## Requirements

1. Каждый design doc из 001-010 linked.
2. Migration order respects FK dependencies.
3. Explicit gate: block 04 auth MUST NOT start DB implementation until block 02 done.
4. Checklist items verifiable (files exist, conventions followed).
5. README index lists all docs/database/*.md files.

---

## Step-by-step Plan

1. Create docs/database/README.md index.
2. Write IMPLEMENTATION_PLAN.md with ordered migration list.
3. Map feature blocks 04-10 to migration groups.
4. Add pre-flight checklist.
5. Final review all subtasks 001-010 complete.
6. Link from block 02 README.

---

## Acceptance Criteria

- IMPLEMENTATION_PLAN.md with ordered migration roadmap.
- docs/database/README.md indexes all design artifacts.
- Feature block mapping complete.
- Gate documented: design before implementation.

---

## Checks

```bash
test -f docs/database/IMPLEMENTATION_PLAN.md
test -f docs/database/README.md
ls docs/database/schemas/
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
