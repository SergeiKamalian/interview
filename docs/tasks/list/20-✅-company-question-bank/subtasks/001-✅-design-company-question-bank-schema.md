# TASK-20.1 — Design doc: company question bank schema

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Зафиксировать design doc **Company Knowledge Layer** — overlay поверх global question bank: taxonomy, overrides, priority, import, snapshot merge policy.

---

## Completion Notes

Создан `docs/database/schemas/company-question-bank.md`:

- ER diagram: company overlay на skills/topics/questions + overrides + playbooks
- Taxonomy policy: `company_id` nullable на skills/topics; professions global-only
- Question metadata: `source_question_id`, `status`, `company_priority`, `is_required`
- `company_question_overrides` — JSON extras + topic_weight_override + merge policy
- Selection priority ORDER BY + suggest algorithm (required pass → pool)
- Import contract: flat Excel columns → `BankTopicFile`-like DTO, validation, preview diff
- Frontend UI guidelines (shadcn, tabs, badges, dark mode)
- Cross-link добавлен в `question-bank.md` → Related

Verification:

- Design doc покрывает все сущности README блока 20
- Snapshot merge описан для реализации TASK-20.5
- Import rules согласованы с checkpoint-weight-rubric и `*.bank.json`
- Противоречий с snapshot policy interview-core нет

Активный subtask → TASK-20.2.
