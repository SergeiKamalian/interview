# TASK-19.10 — Company attempt review state (design + DB + API)

Status: [x] done

## Goal

Зафиксировать на уровне данных и API, **кого компания уже смотрела** и **согласна ли с оценкой ИИ**. Без этого нельзя честно показывать «просмотрено / не просмотрено», фильтр непросмотренных и историю решений.

## Scope

- Design doc в `docs/database/schemas/attempt-review.md`.
- Migration `024_interview_attempt_review_state.sql`: таблицы `interview_attempt_reviews`, `interview_attempt_review_events`.
- Backend module `attempt-review`: repository, service, GraphQL enums/types/mutations.
- Mutations: `markAttemptReviewStarted`, `setAttemptAiVerdict`, `setAttemptCompanyDecision`.
- Fields на `InterviewAttemptSummary` и `CompanyReviewQueueItem`: `reviewStatus`, `aiAssessmentVerdict`, `companyDecision`, `reviewedAt`.
- Filter `companyReviewQueue(unreviewedOnly: true)`.

## Verification

- `pnpm -C backend migrate` → Applied OK: 024
- `pnpm -C backend build` → exit 0
- `pnpm exec eslint` на изменённых backend files → exit 0
- `npx jest src/modules/attempt-review src/modules/candidates/services/company-review-queue.service.spec.ts` → 6 passed
- GraphQL smoke (backend :3000, company1 JWT):
  - `interviewDetails(32).attempts` → все `pending` до действий
  - `markAttemptReviewStarted(105)` → `in_review`
  - `setAttemptAiVerdict(105, agree)` → `reviewed` + `agree` + `reviewedAt`
  - `setAttemptCompanyDecision(108, reject)` → `reviewed` + `reject`

## Completion Notes

- UI не делался (TASK-19.12+).
- `hireRecommendation` ИИ не меняется при disagree — только company verdict axis.
- Следующий subtask: **TASK-19.11** — таблица кандидатов с pagination/selection и без Report.
