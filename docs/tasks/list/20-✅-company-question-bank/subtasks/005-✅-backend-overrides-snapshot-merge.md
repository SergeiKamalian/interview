# TASK-20.5 — Backend: question overrides + snapshot merge

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.2, TASK-20.4  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Company overrides на **global** questions: extra red/green flags без полного fork; merge overrides в interview snapshot при создании интервью.

---

## Context

- Snapshot: `interview-core` копирует checkpoints + `evaluation_hints` + examples
- Use case: «У нас Redux Toolkit, не MobX» — добавить `falseClaims` / `mustConcepts` к global React question
- Design: `company_question_overrides` (TASK-20.1/20.2)

---

## Scope

**Backend:**

1. **CRUD overrides**
   - GraphQL: `companyQuestionOverride(sourceQuestionId)`, `upsertCompanyQuestionOverride`, `deleteCompanyQuestionOverride`
   - Fields: `extraMustConcepts`, `extraFalseClaims`, optional `extraAnswerExamples`, optional `topicWeightOverride`
   - Only for global questions (`source.company_id IS NULL`)
   - One override row per `(company, source_question)`

2. **Merge util** `mergeQuestionWithOverride(globalQuestion, override)`:
   - Checkpoints: keys unchanged; merge `evaluation_hints` arrays (dedupe)
   - Append extra examples with sort_order
   - Optional topic_weight override for snapshot

3. **Integrate in `InterviewCoreService.createInterview`:**
   - For each questionId: if global + override exists → merge before snapshot insert
   - Fork/company-owned questions: no override table (use fork instead)

4. Unit tests:
   - merge hints dedupe
   - snapshot rows contain merged JSON in `interview_question_checkpoints.evaluation_hints`
   - tenant isolation

---

## Out of Scope

- UI for overrides (можно минимально в 20.8 или отдельный panel — зафиксировать в 20.8)
- Retroactive snapshot update for active interviews

---

## Files / Folders Allowed

```txt
backend/src/modules/question-bank/**
backend/src/modules/interview-core/**
backend/src/schema.gql
```

---

## Verification

- Upsert override on global question
- Create interview with that questionId → snapshot checkpoints contain merged `mustConcepts`/`falseClaims`
- Company B override does not affect Company A snapshot
- `pnpm -C backend build` + jest + GraphQL smoke

---

## Completion Notes

**Реализовано:**
- `CompanyQuestionOverrideRepository` — CRUD для `company_question_overrides` с tenant scope по `company_id`
- GraphQL: `companyQuestionOverride`, `upsertCompanyQuestionOverride`, `deleteCompanyQuestionOverride`
- `mergeQuestionWithOverride` util — dedupe `mustConcepts`/`falseClaims` на каждый checkpoint, append examples, `topicWeightOverride`
- `InterviewCoreService.createInterview` — batch load overrides для global questions, merge перед snapshot; `questionTopicWeights` map в repository
- Types: `CompanyQuestionOverrideType`, `OverrideAnswerExampleType`, `UpsertCompanyQuestionOverrideInput`

**Verify:**
- `pnpm -C backend build` → exit 0
- `npx jest src/modules/question-bank src/modules/interview-core/interview-core.service.spec.ts` → 41 passed (9 suites)
- GraphQL smoke (JWT company1, `:3100` rebuilt dist):
  - `upsertCompanyQuestionOverride(656)` → id=1, extraMustConcepts `["redux toolkit","redux"]`, extraFalseClaims `["we use mobx by default"]`, topicWeightOverride=8.5
  - `companyQuestionOverride(656)` → same data
  - company2 `companyQuestionOverride(656)` → null (tenant isolation)
  - `createInterview(questionIds:[656])` → interview id=34
  - MySQL `interview_question_checkpoints` for `fiber_definition`: merged JSON contains `redux toolkit`, `redux`, `we use mobx by default`; `topic_weight=8.50`
- `schema.gql` regen: `CompanyQuestionOverrideType`, `upsertCompanyQuestionOverride`, `deleteCompanyQuestionOverride`, `companyQuestionOverride`

**Повторить проверку:**
```bash
pnpm -C backend build
npx jest src/modules/question-bank src/modules/interview-core/interview-core.service.spec.ts
# GraphQL: upsertCompanyQuestionOverride → createInterview → SELECT evaluation_hints FROM interview_question_checkpoints
```
