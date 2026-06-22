# TASK-20.13 — Fork replaces global in selection + tenant smoke

Status: [x] done  
Priority: Medium  
Parent block: `20-✅-company-question-bank`  
Depends on: TASK-20.4, TASK-20.6  
Owner: Cursor / Sergey  
Last updated: 2026-06-21

---

## Goal

Если у компании есть **published fork** платформенного вопроса — global не попадает в suggest/list для этой компании; другие компании global по-прежнему видят.

---

## Scope

- SQL exclusion в `findSuggestionCandidates` / `buildSuggestionCandidateFilters`
- `questionBank` filter: exclude replaced global unless `scope=global` or `includeForkReplacedGlobal=true`
- GraphQL `QuestionBankFilterInput.includeForkReplacedGlobal`
- Frontend wizard: full pool + client filter; badge «Есть ваша версия» на platform tab
- Design doc section fork replacement
- Unit tests repository
- Cross-tenant verification

---

## Completion Notes

### Backend

- `FORK_REPLACEMENT_EXCLUSION_SQL` в `question-bank.repository.ts`
- Applied to suggest pool + list (unless `scope=global` or `includeForkReplacedGlobal`)
- Only **published** forks trigger replacement; draft forks keep global visible

### Frontend

- `entities/question/lib/forkReplacement.ts` — index + filter helper
- Wizard step 2: `includeForkReplacedGlobal: true`, hide replaced on «Наши»/«Все», badge on «Платформа»
- `QuestionScopeBadges`: «Есть ваша версия»
- `sourceQuestionId` в list GraphQL ops

### Verification

- `pnpm -C backend test -- question-bank.repository.spec` — fork exclusion SQL in suggest + list
- `pnpm -C backend build` — exit 0
- `pnpm -C frontend graphql:sync && pnpm -C frontend build` — exit 0
- Tenant isolation (existing + design): company B `findVisibleById` / override / owned questions company A → null/Forbidden; visibility filter `(company_id IS NULL OR company_id = ?)`

Активный блок остаётся **15-🟡 interview-templates**.
