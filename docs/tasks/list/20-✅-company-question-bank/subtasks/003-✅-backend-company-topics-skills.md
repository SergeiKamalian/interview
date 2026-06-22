# TASK-20.3 — Backend: company topics/skills CRUD

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.2  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

GraphQL API для company-owned topics и skills + расширенные lookups (global + company overlay).

---

## Context

- `question-bank.repository.ts`: `findTopics`, `findSkillsByProfession` — сейчас только global
- Visibility questions: `(company_id IS NULL OR company_id = ?)`
- Company user должен создавать «Internal Platform», «Legacy Auth» и т.д.

---

## Scope

**Backend** (`backend/src/modules/question-bank/`):

- Repository methods:
  - `createCompanyTopic`, `updateCompanyTopic`, `archiveCompanyTopic`
  - `createCompanySkill`, `updateCompanySkill`, `archiveCompanySkill`
  - Extend `findTopics` / `findSkillsByProfession` — union global + company scoped
- GraphQL:
  - Mutations: `createCompanyTopic`, `updateCompanyTopic`, `createCompanySkill`, …
  - Queries: extend `topics` / `skills` — badge `isCustom: Boolean` на type
- Validation:
  - `code` snake_case, unique per `(company_id, code)`
  - Company cannot mutate global rows (`company_id IS NULL` → Forbidden)
- Tenant scope: все mutations через `@CurrentUser().companyId`
- Regenerate `schema.gql`
- Unit tests: create topic, duplicate code reject, cannot edit global

---

## Out of Scope

- Question CRUD UI (TASK-20.7)
- Import (TASK-20.10)
- Fork (TASK-20.4)

---

## Files / Folders Allowed

```txt
backend/src/modules/question-bank/**
backend/src/schema.gql
```

---

## Verification

- `pnpm -C backend build`
- Targeted jest для repository/service
- GraphQL smoke:
  - create company topic under company skill
  - list topics shows global + custom with `isCustom`
  - company2 cannot see company1 topics
- `pnpm -C backend migrate` если migration правки

---

## Completion Notes

**Реализовано:**

- Repository CRUD: `createCompanyTopic/Skill`, `updateCompanyTopic/Skill`, `archiveCompanyTopic/Skill`
- Lookups: `findTopics` / `findSkillsByProfession` с фильтром `(company_id IS NULL OR company_id = ?)`; profession-filter включает company-owned skills/topics
- GraphQL mutations (6) + `isCustom: Boolean!` на `TopicType` / `SkillType`
- Validation: snake_case code, interviewWeight 1–10, duplicate → `DUPLICATE_*_CODE`, global rows → `ForbiddenException`
- `findTopicById` / `findSkillsByIds` принимают `companyId` для tenant visibility

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `pnpm -C backend build` | exit 0 | exit 0 |
| `pnpm exec jest question-bank.repository.spec.ts question-bank.service.spec.ts question-suggestion.service.spec.ts` | pass | 3 suites, 15 tests passed |
| GraphQL smoke (curl, 2 companies) | create skill/topic, isCustom, tenant isolation, duplicate reject, global forbidden | OK: `internal_platform` skill + `legacy_auth` topic created; company B не видит custom; `DUPLICATE_TOPIC_CODE`; `Global topics cannot be modified` на topic id=114 |
| `schema.gql` regen | новые mutations + isCustom | OK (Nest boot) |

**Повторить smoke:**

```bash
pnpm -C backend build && pnpm -C backend start
# register 2 companies → Bearer tokens
# createCompanySkill / createCompanyTopic / topics / skills queries
```
