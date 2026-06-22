# TASK-20.4 — Backend: fork global question + publish + priority

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.2, TASK-20.3 (topics для привязки)  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Расширить company question CRUD: fork платформенного вопроса, draft/publish lifecycle, `company_priority` и `is_required`.

---

## Context

- `QuestionBankService.create/update` уже пишет `company_id`
- `CreateQuestionInput` / `CheckpointInput` — полный набор полей
- Frontend кнопка «Создать вопрос» disabled — API нужно дополнить fork + metadata

---

## Scope

**Backend:**

1. **Mutation `forkQuestion(sourceQuestionId: ID!)`**
   - Copy: question_text, answers, checkpoints, examples, skills, topic (или allow retarget to company topic)
   - Set: `company_id`, `source_question_id`, `status=draft`
   - Global question read-only — fork only

2. **Extend create/update inputs:**
   - `status`, `companyPriority` (0–10), `isRequired`
   - Filter `questionBank` list: optional `scope: global | company | all`, `status`

3. **Repository:**
   - `findSuggestionCandidates` — по умолчанию только `status=published`
   - `findVisibleById` — respect status для suggest; create interview может включать draft если явно передан id

4. **Validation:**
   - `is_required` только для `company_id NOT NULL`
   - Cannot set priority/required on global questions

5. GraphQL types: expose `sourceQuestionId`, `status`, `companyPriority`, `isRequired`, `isCustom`

6. Unit tests + schema regen

---

## Out of Scope

- Overrides (TASK-20.5)
- Selection boost algorithm (TASK-20.6)
- Frontend fork UI (TASK-20.8)

---

## Files / Folders Allowed

```txt
backend/src/modules/question-bank/**
backend/src/schema.gql
```

---

## Verification

- Fork global question → new row with `company_id`, copied checkpoints, `source_question_id` set
- Update priority/isRequired on company question
- Draft question excluded from `findSuggestionCandidates` by default
- Explicit questionIds in createInterview still accepts draft if owned by company
- GraphQL smoke + jest

---

## Completion Notes

**Реализовано:**
- `forkQuestion(sourceQuestionId)` — копирует global question (checkpoints/skills/examples), ставит `company_id`, `source_question_id`, `status=draft`
- `CreateQuestionInput` / `UpdateQuestionInput`: `status`, `companyPriority`, `isRequired`; default create `status=draft`
- `QuestionBankFilterInput`: `scope` (`global|company|all`), `status`
- Repository: metadata columns в SELECT/map; `findSuggestionCandidates` → `status=published`; `forkQuestion`, scope/status filters
- GraphQL `QuestionType`: `sourceQuestionId`, `status`, `companyPriority`, `isRequired`, `isCustom`; enums `QuestionStatus`, `QuestionScope`
- Validation: `validateCompanyQuestionMetadata` — metadata только для company-owned; priority 0–10
- Fix: `@IsEnum` на `level`/`difficulty` + `@InputType({ isAbstract: true })` на `CreateQuestionInput` для ValidationPipe whitelist

**Verify:**
- `pnpm -C backend build` → exit 0
- `npx jest src/modules/question-bank` → 25 passed (5 suites)
- GraphQL smoke (JWT company1, `:3000`):
  - `forkQuestion(656)` → id=657, `sourceQuestionId=656`, `status=draft`, 8 checkpoints copied
  - `updateQuestion(657)` with `companyPriority=8`, `isRequired=true`, `status=published` → MySQL + `question(657)` OK
  - `questionBank(scope:company, status:draft)` → draft fork visible; `suggestInterviewQuestions` при draft 657 не включал id=657 в questionIds; после publish draft filter total=0
  - Second fork → id=658 draft, excluded from suggest pool (94 published candidates, draft not listed)
- `schema.gql` regen: `forkQuestion`, `QuestionStatus`, `QuestionScope`, extended inputs/types

**Повторить проверку:**
```bash
pnpm -C backend build
npx jest src/modules/question-bank
# GraphQL: forkQuestion → updateQuestion (priority) → questionBank filters → suggestInterviewQuestions
```
