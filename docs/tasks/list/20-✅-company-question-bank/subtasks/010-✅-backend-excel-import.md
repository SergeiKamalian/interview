# TASK-20.10 — Backend: Excel/CSV bulk import

Status: [x] done  
Priority: Medium  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.3, TASK-20.4  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Bulk import company question bank из Excel/CSV: parse → validate → preview diff → commit upsert.

---

## Context

- Internal contract = `backend/seeds/topics/*.bank.json` structure
- REST upload pattern — как file upload в проекте (health/upload endpoints)
- Flat Excel row = one checkpoint (question/topic columns repeated)

---

## Scope

**Backend:**

1. **Parser service** `company-question-import.service.ts`:
   - Accept `.xlsx`, `.csv` (use `xlsx` or similar — добавить dependency если нет)
   - Flat columns (document in design doc):
     `topic_code`, `topic_name`, `skill_code`, `interview_weight`, `question_text`, `level`, `difficulty`, `short_answer`, `ideal_answer`, `checkpoint_key`, `checkpoint_title`, `checkpoint_expected`, `checkpoint_weight`, `must_concepts`, `false_claims`, `example_good`, `example_bad`
   - Group rows → topics → questions → checkpoints

2. **Validation:**
   - Σ checkpoint weights = 10 per question
   - Enums level/difficulty
   - Unique checkpoint_key per question
   - Tenant scope: all rows → `company_id` from auth
   - Conflict: existing company topic/question by code

3. **Preview mutation** `previewCompanyQuestionImport(file)` or two-step REST:
   - Returns: `{ toCreate, toUpdate, errors, warnings }`

4. **Commit mutation** `commitCompanyQuestionImport(importToken)`:
   - Idempotent upsert within transaction
   - New rows default `status=draft` (configurable → published)

5. **REST** `POST /api/company/question-bank/import` multipart (optional if GraphQL upload awkward)

6. Unit tests: valid file, weight sum error, duplicate key

---

## Out of Scope

- AI auto-structure from freeform text
- Import global platform bank
- Frontend UI (TASK-20.11)

---

## Files / Folders Allowed

```txt
backend/src/modules/question-bank/**
backend/src/modules/upload/**  (if reuse)
backend/src/schema.gql
docs/database/schemas/company-question-bank.md  (column spec)
```

---

## Verification

- Sample CSV 2 topics / 3 questions → preview shows counts
- Commit → rows in DB with company_id
- Invalid Σ weights → preview errors, no commit
- Re-import same codes → update not duplicate
- jest + curl multipart smoke

---

## Completion Notes

**Реализовано:**

- `parse-company-import-file.ts` — парсинг `.csv`/`.xlsx` через `xlsx`, flat columns из design doc, группировка rows → topics/questions/checkpoints
- `CompanyQuestionImportService` — preview (REST) + commit (GraphQL), Redis cache `importToken` 15 min
- REST `POST /api/company/question-bank/import/preview` multipart + `RestAuthGuard`
- GraphQL `commitCompanyQuestionImport(input: { importToken, status? })`
- Repository lookups: `findProfessionByCode`, `findSkillByCode`, `findOwnedTopicByCode`, `findOwnedQuestionByTopicAndText`
- Fix: `QuestionBankRepository.create/update` reload внутри transaction через `query`
- Fixtures: `sample-company-import.csv`, `bad-weights.csv`
- Unit tests: parser + service (9 tests)

**Проверки:**

| Команда | Ожидание | Результат |
|---------|----------|-----------|
| `pnpm run build` (backend) | exit 0 | exit 0 |
| `pnpm test -- company-question-import parse-company-import` | 9 passed | 9 passed |
| `curl -F file=@sample-company-import.csv .../import/preview` | 2 topics, 2 questions, 4 checkpoints, importToken | OK |
| `curl bad-weights.csv preview` | errors, importToken null | OK |
| `commitCompanyQuestionImport` | topicsCreated=2, questionsCreated=2 | OK |
| Re-import same file | toUpdate topics=2, questions=2, toCreate topics=0 | OK |

**Smoke (port 3002, rebuilt dist):**

```bash
# register → preview multipart → commit GraphQL → re-preview shows updates
```

**Изменённые файлы:** см. git status в `backend/src/modules/question-bank/`, `backend/src/modules/auth/guards/rest-auth.guard.ts`, `backend/package.json`.
