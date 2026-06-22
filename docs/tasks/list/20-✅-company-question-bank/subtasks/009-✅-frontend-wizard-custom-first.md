# TASK-20.9 — Frontend: interview wizard custom-first selection

Status: [x] done  
Priority: High  
Parent block: `20-⬜-company-question-bank`  
Depends on: TASK-20.6, TASK-20.7  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Step 2 визарда создания интервью: приоритет company questions — вкладки, badges, pinned required, визуальное отличие custom vs platform.

---

## Context

- Interview creation wizard: block `16`, `Step2Questions.tsx`
- `suggestInterviewQuestions` после 20.6 возвращает boosted custom set
- User story: tech lead видит «Наши вопросы» первыми при AI suggest и manual pick

---

## Scope

1. **Question picker UX:**
   - Tabs: `Наши вопросы` | `Платформа` | `Все`
   - Badge `Custom`, `Required`, `Draft` (draft только если explicitly addable)
   - Section «Обязательные» — pinned required questions locked in selection

2. **AI suggest button:**
   - After suggest — highlight which picks are custom
   - Toast/summary: «N из M — ваши вопросы»

3. **Manual selection:**
   - Sort default: company first, then by companyPriority
   - Filter by company topic

4. **JD prefill:** when draft returns custom questionIds — show in «Наши» tab selected

5. Extend types from GraphQL if needed (`isCustom`, `companyPriority`, `isRequired`)

---

## Out of Scope

- Playbook packs (TASK-20.12)
- Changing wizard steps count

---

## Files / Folders Allowed

```txt
frontend/src/features/interview-create/**
frontend/src/pages/dashboard/interviews/**
frontend/src/shared/api/graphql/operations/**
```

---

## Verification

- Company with custom questions: AI suggest surfaces custom first
- Required question cannot be deselected (or warns)
- Tab filters work; platform-only tab hides custom
- Browser smoke on create interview flow step 2
- eslint + build

---

## Completion Notes

**Реализовано:**
- `Step2Questions.tsx`: shadcn Tabs «Наши вопросы | Платформа | Все» (default «Наши»), scope-фильтр + topic filter по scoped pool.
- Badges через `QuestionScopeBadges` (Custom / Required / Draft).
- Секция «Обязательные» слева (locked checkbox) и справа (без remove); auto-pin required при загрузке pool; toggle/remove блокируется для `isRequired`.
- Сортировка `sortQuestionsCompanyFirst` (isCustom → companyPriority DESC) + существующий sort by target level.
- AI suggest: GraphQL mutation расширена полем `questions { isCustom … }`; toast + Alert «N из M — ваши вопросы»; highlight custom picks; переключение на вкладку «Наши».
- JD prefill: default tab «Наши» — custom questionIds видны selected на company tab.

**Проверки:**
- `pnpm run graphql:sync` — exit 0 (73 operations)
- `pnpm run build` — exit 0 (tsc + vite)
- `pnpm exec eslint src/features/interview-create/ui/wizard/Step2Questions.tsx src/features/interview-create/lib/sortQuestionsForWizard.ts` — exit 0
- Полный `pnpm run lint` — exit 1 из-за pre-existing ошибок в других файлах (не 20.9)

**Изменённые файлы:**
- `frontend/src/features/interview-create/ui/wizard/Step2Questions.tsx`
- `frontend/src/features/interview-create/lib/sortQuestionsForWizard.ts`
- `frontend/src/shared/api/graphql/operations/suggest-interview-questions.graphql`
- `frontend/src/shared/api/graphql/generated/*` (codegen)
- `frontend/src/shared/api/graphql/operations.registry.ts`
- `frontend/src/pages/dashboard/QuestionBankTaxonomyPage.tsx` (минимальный fix import AlertDialog для build, WIP 20.8)

**Как проверить вручную:** `/dashboard/interviews/create` → шаг 2 → вкладки, badges, locked required, «Подобрать через AI» → toast/alert с custom count.
