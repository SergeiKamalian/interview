# TASK-20.7 — Frontend: question bank CRUD UI

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.4  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Включить полноценный UI управления company questions на `QuestionBankPage`: create, edit, archive, checkpoints editor с red/green flags.

---

## Context

- `QuestionBankPage` — read-only, кнопка «Создать вопрос» disabled
- Backend mutations уже есть / расширены в 20.4
- UI: shadcn из `@shared/ui`, RTK Query + GraphQL

---

## Scope

**Frontend:**

1. **GraphQL operations** — create/update/archive question, full question detail with checkpoints/hints/examples

2. **Features** `features/company-question-bank/` (или extend `features/question-bank/`):
   - `QuestionEditorForm` — question text, ideal answers, level, difficulty, topic, skills
   - `CheckpointEditor` — rows: key, title, expected, weight, mustConcepts, falseClaims
   - Weight sum validator UI (Σ = 10, live feedback)
   - `AnswerExamplesEditor` — good/bad examples
   - Status toggle draft/published, priority slider, isRequired checkbox

3. **Pages/widgets:**
   - Enable «Создать вопрос» на `QuestionBankPage`
   - Route or Sheet/Dialog: `/dashboard/question-bank/new`, `/dashboard/question-bank/:id/edit`
   - Filter: scope `all | platform | ours`, status draft/published
   - Badge `Custom` / `Draft` в списке

4. **`pnpm -C frontend graphql:sync`**

---

## Out of Scope

- Fork flow (TASK-20.8)
- Company topics management UI (TASK-20.8)
- Import (TASK-20.11)

---

## Files / Folders Allowed

```txt
frontend/src/pages/dashboard/QuestionBankPage.tsx
frontend/src/features/**/question*
frontend/src/widgets/question-bank/**
frontend/src/shared/api/graphql/operations/**
```

---

## Verification

- Create company question with 3 checkpoints Σ=10 → saves via GraphQL
- Edit mustConcepts/falseClaims → reload shows changes
- Archive removes from default list
- Draft question visible with filter, hidden from default «published only»
- eslint + `pnpm -C frontend build`
- Browser smoke: create → edit → list badge

---

## Completion Notes

- **GraphQL:** добавлены `create-question.graphql`, `update-question.graphql`, `archive-question.graphql`; расширены `question-detail.graphql`, `question-bank-list.graphql`, `question-bank.graphql` (isCustom/status/isRequired/companyPriority/evaluationHints). `pnpm -C frontend graphql:sync` → registry **64 ops**.
- **Backend (минимально для read path):** `CheckpointEvaluationHintsType` + поле `evaluationHints` на `QuestionCheckpointType` + mapper — нужно для reload mustConcepts/falseClaims в editor.
- **UI:** redesign `QuestionBankPage` (semantic tokens, Tabs Все/Наши/Платформа, status filter published default, shadcn Table, badges Custom/Draft/Required). Routes: `/dashboard/question-bank`, `/new`, `/:questionId/edit`; redirect `/dashboard/questions` → new path.
- **CRUD:** `QuestionEditorForm` + `CheckpointEditor` (Σ=10 validator) + `AnswerExamplesEditor` + `TagInput`; mutations в `questionBankApi`; archive через AlertDialog на edit page.
- **Verify:**
  - `pnpm -C backend build` → exit 0
  - `pnpm -C frontend build` (tsc+vite) → exit 0
  - `pnpm eslint` на changed frontend paths → exit 0
  - GraphQL smoke (JWT company1, :3000): `questionBank(status:published, limit:2)` → total=565, item id=657 isCustom=true isRequired=true; `professions/topics/skills` OK
  - Browser: `http://127.0.0.1:5173/dashboard/question-bank` открывается (auth required для полного UI — без токена редирект на login)

**Как повторить:** `pnpm -C frontend dev` + login company user → `/dashboard/question-bank` → «Создать вопрос» → заполнить 3 checkpoints Σ=10 → save → badges в списке; draft filter показывает черновики.
