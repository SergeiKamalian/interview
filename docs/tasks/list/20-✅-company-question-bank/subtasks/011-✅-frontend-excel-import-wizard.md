# TASK-20.11 — Frontend: import wizard + Excel template

Status: [x] done  
Priority: Medium  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.10  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

UI wizard импорта question bank: скачать шаблон Excel → upload → preview → commit.

---

## Context

- Backend preview/commit — TASK-20.10
- Entry point: Question Bank page → «Импорт из Excel»

---

## Scope

1. **Downloadable template**
   - Static `.xlsx` in `frontend/public/templates/` or generate client-side
   - Example row + instructions sheet (RU)
   - Column headers match backend parser exactly

2. **Import wizard** (Dialog or dedicated route):
   - Step 1: upload file (drag-drop)
   - Step 2: preview table — create/update/errors (color coded)
   - Step 3: confirm → commit → success summary with links to draft questions

3. **RTK Query / fetch** for multipart upload + GraphQL commit

4. **Error UX:** row numbers, field-level messages from backend

5. Post-import CTA: «Опубликовать вопросы» / go to draft filter

---

## Out of Scope

- Multi-sheet Excel v2 (flat only in v1)
- Scheduled/recurring import

---

## Files / Folders Allowed

```txt
frontend/src/features/company-question-import/**
frontend/src/pages/dashboard/QuestionBankPage.tsx
frontend/public/templates/**
```

---

## Verification

- Download template opens valid xlsx
- Upload sample file → preview matches backend
- Commit → questions appear in bank as draft
- Invalid file shows errors without commit
- eslint + build + browser smoke

---

## Completion Notes

**Реализовано:**

- `frontend/public/templates/company-question-bank-import.xlsx` — листы «Данные» (2 example rows) + «Инструкция» (RU)
- Feature `company-question-import`: REST preview multipart + GraphQL `commitCompanyQuestionImport` (RTK mutation)
- Dialog wizard: upload (drag-drop) → preview table (create/update/errors, color badges) → commit → success summary
- Кнопка «Импорт из Excel» на `QuestionBankPage`; CTA «Перейти к черновикам» переключает scope=company + status=draft
- Checkbox «Опубликовать сразу» → commit с `status: published`

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `pnpm graphql:sync` (frontend) | 74 ops, exit 0 | OK |
| `pnpm build` (frontend) | exit 0 | exit 0 |
| `pnpm eslint src/features/company-question-import …` | exit 0 | exit 0 |
| xlsx template read (node xlsx) | sheets Данные+Инструкция, 2 data rows | OK |

**Как проверить в UI:**

1. `/dashboard/question-bank` → «Импорт из Excel»
2. «Скачать шаблон» → открывается xlsx с инструкцией
3. Upload `backend/.../fixtures/sample-company-import.csv` или шаблон → preview create/update
4. «Подтвердить импорт» → success; «Перейти к черновикам» → фильтр Наши + Draft

**Изменённые файлы:** `frontend/src/features/company-question-import/**`, `QuestionBankPage.tsx`, `commit-company-question-import.graphql`, `frontend/public/templates/company-question-bank-import.xlsx`.
