# TASK-20.12 — Company playbook packs

Status: [x] done  
Priority: Medium  
Parent block: `20-✅-company-question-bank`  
Depends on: TASK-20.4, TASK-20.6, TASK-20.9  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Company **playbook packs** — переиспользуемые наборы pinned custom + recommended platform questions для типовых вакансий; интеграция с interview templates (block 15) где уместно.

---

## Context

- `is_required` questions — TASK-20.4
- Interview templates block `15` — reusable blueprints
- Use case: «Frontend Middle @ OurCompany» = 3 pinned internal + 7 from platform pool

---

## Scope

**Design + implementation (minimal v1):**

1. **Table** `company_question_playbooks` (+ items M2M):
   - `company_id`, `name`, `profession_id`, `level`, optional `skill_ids` JSON
   - Items: `{ question_id, sort_order, is_pinned }`

2. **GraphQL:**
   - CRUD playbooks
   - `applyPlaybookToInterviewDraft(playbookId)` → returns suggested questionIds (required first + fill count)

3. **Frontend:**
   - Question Bank → «Playbooks» section
   - Create playbook from current wizard selection («Save as playbook»)
   - Wizard step 2: dropdown «Применить playbook»

4. **Integration with templates (light):**
   - Optional field on `interview_templates`: `playbook_id`
   - Document in design doc if template schema change deferred

---

## Out of Scope

- Cross-company playbook marketplace
- Versioning / audit of playbook changes
- Full merge with block 15 if scope too large — document defer path

---

## Files / Folders Allowed

```txt
backend/migrations/029_*.sql  (028 занят conduct_moderation)
backend/src/modules/question-bank/**
backend/src/modules/interview-templates/**  (minimal touch)
frontend/src/features/**
docs/database/schemas/company-question-bank.md
```

---

## Verification

- Create playbook with 2 pinned custom + 5 recommended
- Apply in wizard → 2 locked + AI/manual fill rest
- Save wizard selection as new playbook
- Tenant isolation
- build + smoke

---

## Completion Notes

**Реализовано:**

- Migration `029_company_question_playbooks.sql` — таблицы `company_question_playbooks` + `company_question_playbook_items` (028 уже занят `conduct_moderation`).
- Backend: `CompanyQuestionPlaybookRepository/Service`, GraphQL `companyQuestionPlaybooks`, `companyQuestionPlaybook`, `create/update/archiveCompanyQuestionPlaybook`, `applyPlaybookToInterviewDraft(playbookId, count?)`; suggest input расширен `excludeQuestionIds`.
- Frontend: секция Playbooks на Question Bank, `SavePlaybookDialog` в wizard step 2, dropdown «Применить playbook», pinned lock в UI.
- `interview_templates.playbook_id` отложен (задокументировано в design doc как optional later).

**Verify:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `pnpm -C backend build` | exit 0 | exit 0 |
| `npx jest company-question-playbook.service.spec.ts question-suggestion.service.spec.ts` | pass | 11 passed |
| `pnpm -C backend migrate` | Applied 029 | Applied OK: 029 |
| `pnpm -C frontend graphql:sync` | exit 0 | 78 ops registry |
| `pnpm -C frontend build` | exit 0 | tsc+vite exit 0 |
| GraphQL smoke (company1 JWT, dist :3000) | create 2 pinned + apply count=10 | create id=2 pinnedCount=2; apply pinnedQuestionIds=[92,97] count=10 (2 pinned + 8 suggest fill) |
| GraphQL tenant (company12) | [] playbooks | `companyQuestionPlaybooks: []` |

**Как повторить smoke:**

```bash
cd backend && pnpm build && NODE_ENV=development node dist/main.js
# JWT HS256 companyId=1 (JWT_SECRET из .env)
# createCompanyQuestionPlaybook + applyPlaybookToInterviewDraft(playbookId, count:10)
```
