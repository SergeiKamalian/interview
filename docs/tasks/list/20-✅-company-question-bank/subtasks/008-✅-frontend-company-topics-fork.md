# TASK-20.8 — Frontend: company topics + fork flow

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.3, TASK-20.4, TASK-20.7  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

UI для company topics/skills и action «Форкнуть» на платформенном вопросе; minimal UI для overrides на global question.

---

## Context

- Company topics API — TASK-20.3
- Fork mutation — TASK-20.4
- Overrides API — TASK-20.5 (minimal panel здесь)

---

## Scope

1. **Company taxonomy management**
   - Section on Question Bank page или `/dashboard/question-bank/taxonomy`
   - Lists: company skills, company topics (with interview weight)
   - Create/edit/archive dialogs

2. **Fork flow**
   - On platform question detail: button «Форкнуть под себя»
   - Opens QuestionEditorForm pre-filled (TASK-20.7) in draft status
   - Allow retarget to company topic

3. **Overrides panel** (minimal v1)
   - On global question detail: «Добавить свои red/green flags»
   - Fields: extraMustConcepts, extraFalseClaims (tag input)
   - Save via upsertCompanyQuestionOverride

4. GraphQL ops + RTK Query hooks

---

## Out of Scope

- Full override examples editor (optional nice-to-have)
- Excel import UI

---

## Files / Folders Allowed

```txt
frontend/src/pages/dashboard/**
frontend/src/features/**
frontend/src/widgets/question-bank/**
frontend/src/shared/api/graphql/operations/**
```

---

## Verification

- Create company topic «Internal API Gateway» under React skill
- Fork global useEffect question → edit falseClaims → published
- Add override on another global question without fork
- Browser smoke + build

---

## Completion Notes

- **Taxonomy page** `/dashboard/question-bank/taxonomy`: Tabs Topics/Skills, shadcn Table, create/edit Dialog, archive AlertDialog; link «Taxonomy» на QuestionBankPage.
- **Fork flow**: кнопка «Форкнуть под себя» на QuestionBankEditorPage для global question → `forkQuestion` → redirect на edit forked draft (QuestionEditorForm editable, retarget topic via SelectField).
- **Overrides panel** `CompanyQuestionOverridePanel`: TagInput extraMustConcepts/extraFalseClaims → `upsertCompanyQuestionOverride`; load via `companyQuestionOverride`.
- **GraphQL**: +9 ops (fork, company skill/topic CRUD×6, override query+upsert); `skills`/`topics` queries extended with `isCustom`; registry **73 ops**.
- **API**: `companyQuestionBankApi.ts` — RTK Query hooks для всех mutations/queries.
- Verify:
  - `pnpm -C frontend graphql:sync` → exit 0, 73 operations
  - `pnpm -C frontend build` → exit 0 (tsc + vite)
  - `pnpm eslint src/features/company-question-bank src/pages/dashboard/QuestionBank*.tsx` → exit 0 (changed files only; full-project lint has pre-existing errors in unrelated files)
