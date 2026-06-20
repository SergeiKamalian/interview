# TASK-19.1 — Company review queue

Status: [x] done

## Goal

Добавить company-side review queue для завершённых interview attempts, чтобы hiring team видела, кого нужно посмотреть после прохождения интервью.

## Scope

- Backend GraphQL query для списка review attempts в рамках `companyId` текущего пользователя.
- Поля: candidate, interview, completedAt, evaluationStatus, score, hireRecommendation, achievedLevel, achievedLevelMethod, needsManualReview, shortlistStatus.
- Frontend RTK Query + GraphQL operation.
- Dashboard route/page `Review Queue`.
- Фильтры первого прохода:
  - search по candidate/interview/email;
  - evaluation status;
  - shortlist only;
  - manual review only.
- Быстрые ссылки:
  - candidate report;
  - interview details with `attemptId`.

## Out of Scope

- Новая DB table для hiring decision state.
- ATS export.
- Email/calendar automation.
- Video/audio playback.

## Verification

- Backend build.
- Backend targeted tests для service mapping.
- Frontend `graphql:sync`.
- Frontend build.
- GraphQL smoke-check review queue.
- UI smoke-check route `/dashboard/review`.

## Completion Notes

Реализован первый company-side post-interview slice:

- Backend GraphQL query `companyReviewQueue(filters)` в `candidates` module.
- Tenant scope берётся из `@CurrentUser().companyId`.
- Query возвращает только `completed` attempts с `is_preview = 0`.
- Поля очереди: candidate/interview, `completedAt`, `evaluationStatus`, `totalScore`, `hireRecommendation`, `achievedLevel`, `achievedLevelMethod`, `needsManualReview`, `shortlistStatus`.
- Frontend RTK Query layer + GraphQL operation.
- Dashboard route `/dashboard/review`.
- Sidebar link `Review queue`.
- UI filters: search, evaluation status, sort, shortlist only, manual review only.
- Быстрые ссылки: candidate report и interview details with `attemptId`.

Verification:

- `pnpm -C backend build` — ожидал успешную компиляцию backend; получил exit 0.
- `pnpm -C backend test -- company-review-queue.service.spec.ts` — ожидал unit coverage маппинга и pending/ready статуса; получил 1 suite / 3 tests passed.
- `pnpm -C frontend graphql:sync` — ожидал генерацию типов/registry для нового query; получил exit 0, registry = 49 operations.
- `pnpm -C frontend build` — ожидал успешный `tsc -b && vite build`; получил exit 0, только стандартный Vite chunk-size warning.
- Targeted eslint backend/frontend — ожидал 0 ошибок; первый прогон нашёл 2 Prettier форматирования, после `eslint --fix` повторный прогон exit 0.
- GraphQL smoke-check на живом backend `/graphql`: `companyReviewQueue(pageSize:5)` для company1 вернул total=2, attempts `105` и `102`, оба `evaluationStatus=ready`, со score/recommendation/achievedLevel/shortlist.
- UI smoke-check: frontend dev `/dashboard/review` через Vite proxy `/graphql`, company1 token в localStorage; страница открылась, таблица показала 2 строки:
  - Алексей Петров — score 8.5, `strong_invite`, `middle`, shortlist `none`;
  - Sergey Frontend — score 5.5, `maybe`, `junior`, shortlist `shortlisted`.
  Проверены фильтры и ссылки `Report` / `Details` в DOM.
