# TASK-19.15 — Team notes on attempts

Status: [x] done

## Goal

Внутренние заметки hiring team по попытке («согласен, но слабый English»), видимые коллегам в компании.

## Scope

- DB: `interview_attempt_review_notes` (design в `docs/database/schemas/attempt-review.md`).
- GraphQL: list/create/update notes (author, created_at, body); tenant-scoped.
- UI: panel на `AttemptReviewPage` + compact indicator в таблице («есть заметки»).
- Markdown/plain text only; без @mentions в первом проходе.

## Depends on

- TASK-19.10 (attempt review entity / company scope)

## Verification

- две заметки от одного user → persist; другой user той же company видит
- tenant isolation smoke

## Completion Notes

**Команды:**
- `cd backend && rm -rf dist && npm run build` — OK
- `cd backend && npm test -- attempt-review.service.spec.ts` — 7 passed (включая list/create/update notes)
- `cd backend && npm run migrate` — `025_interview_attempt_review_notes.sql` applied OK
- `cd frontend && pnpm graphql:sync && pnpm run build` — OK

**Поведение:**
- `attemptReviewNotes`, `createAttemptReviewNote`, `updateAttemptReviewNote` — tenant-scoped через `company_id` + `assertReviewableAttempt`
- `updateAttemptReviewNote` — только автор (`ForbiddenException` иначе)
- `InterviewAttemptSummary.hasTeamNotes` — EXISTS subquery в списках attempts
- UI: `AttemptTeamNotesPanel` на review page, `AttemptTeamNotesIndicator` в колонке Review таблицы

**Проверка в UI:**
1. Открыть `/dashboard/interviews/:id/attempts/:attemptId/review`
2. Добавить 2 заметки → обе видны после reload
3. Войти другим user той же company → заметки видны
4. В таблице кандидатов на Interview Details — badge «Есть заметки»
