# TASK-19.12 — AI assessment verdict UI (согласен / не согласен)

Status: [x] done

## Goal

Дать hiring manager явное действие: **одобрить оценку ИИ** или **не согласиться**, чтобы было понятно, где человек проверил результат модели.

## Completion Notes

- `AiAssessmentVerdictPanel` на `AttemptReviewPage`: CTA «Согласен с ИИ» / «Не согласен с ИИ», optional reason, badge текущего статуса.
- `markAttemptReviewStarted` вызывается при открытии review (`useEffect`).
- `AiAssessmentVerdictBadge` + фильтр «Не согласен с ИИ» в таблице `InterviewDetailsPage`; backend filter `disagreeOnly`.
- GraphQL mutations в отдельных `.graphql` файлах (`mark-attempt-review-started`, `set-attempt-ai-verdict`, `set-attempt-company-decision`).

**Verify:**
- `pnpm -C frontend graphql:sync` → 61 ops
- `pnpm -C frontend build` → exit 0
- `pnpm -C backend build` → exit 0
- `pnpm -C backend test -- attempt-review` → 10 passed
