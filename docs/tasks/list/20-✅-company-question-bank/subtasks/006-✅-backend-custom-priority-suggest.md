# TASK-20.6 — Backend: custom priority in question selection

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.4, TASK-20.5  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

При подборе вопросов (`suggestInterviewQuestions`, JD draft) **приоритизировать** company questions: pinned required first, then priority boost, then existing interview_weight logic.

---

## Context

- `findSuggestionCandidates` ORDER BY: `t.interview_weight DESC, q.id ASC` — company boost отсутствует
- `question-suggestion.prompt.ts` — не упоминает custom questions
- `job-description-draft.service.ts` вызывает suggest — должен наследовать новую логику

---

## Scope

1. **Repository `findSuggestionCandidates`:**
   ```sql
   ORDER BY
     q.is_required DESC,
     (q.company_id IS NOT NULL) DESC,
     q.company_priority DESC,
     t.interview_weight DESC,
     q.id ASC
   ```

2. **Selection service:**
   - Pre-pass: collect all `is_required=1` published company questions matching profession/level/skills → prepend to result (dedupe)
   - AI pool: mark candidates with `isCustom: true` in prompt payload
   - Fallback selection: same priority ordering

3. **Update `question-suggestion.prompt.ts`:**
   - Rule: when equally relevant, prefer `isCustom` / higher `companyPriority`
   - Required questions already selected — AI fills remainder

4. **Extend `SuggestionCandidateEntity` / GraphQL payload** with `isCustom`, `companyPriority`, `isRequired`

5. **JD draft:** ensure required + boosted custom questions surface in prefill

6. Unit tests: company question ranks above global at equal topic weight; required always included

---

## Out of Scope

- Frontend wizard UX (TASK-20.9)
- Playbook packs (TASK-20.12)

---

## Files / Folders Allowed

```txt
backend/src/modules/question-bank/**
backend/src/schema.gql
```

---

## Verification

- Seed: company question with priority 8 vs global same topic weight 5 → company appears first in fallback
- Required question always in suggest result when filters match
- AI path: prompt includes isCustom flags; guard still applies
- JD draft smoke with custom questions in bank
- jest + GraphQL smoke

---

## Completion Notes

**Реализовано:**
- `SuggestionCandidateEntity`: `isCustom`, `companyPriority`, `isRequired`
- `findSuggestionCandidates`: новый ORDER BY (required → custom → priority → weight → id)
- `findRequiredSuggestionCandidates`: pre-pass для pinned company questions
- `QuestionSuggestionService.suggest`: required prepend + AI/fallback для remainder; `mergeSelection` dedupe
- `question-suggestion.prompt.ts` v1.1.0: правило prefer isCustom/companyPriority; поля в candidate lines
- `JobDescriptionDraftService` наследует логику через `QuestionSuggestionService` (без изменений)

**Verify:**
- `npm run build` (backend) → exit 0
- `npm test -- --testPathPatterns=question-bank` → 43 passed (8 suites)
- GraphQL smoke (JWT company1, rebuilt dist `:3200`):
  - `suggestInterviewQuestions(professionId:1, level:senior, count:3)` → `questionIds` начинается с `657` (isCustom=true, companyPriority=8, isRequired=true); global fork source `656` ниже custom
  - `count:1` → только required `657`
- JD draft: тот же suggest path — отдельный smoke не нужен (reuse service)

**Повторить проверку:**
```bash
pnpm -C backend build
pnpm -C backend test -- --testPathPatterns=question-bank
PORT=3200 node backend/dist/main.js
# GraphQL: suggestInterviewQuestions с company required question (id=657) и global same topic (656)
```
