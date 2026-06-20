# TASK-19.13 — Shortlist + quick hiring actions

Status: [x] done

## Goal

Действия из таблицы и review **без лишних переходов**: shortlist, отклонить, пригласить на live, скопировать summary.

## Completion Notes

- `AttemptQuickActions` feature: shortlist toggle (reuse shortlist API + `setAttemptCompanyDecision`), «На live», «Отклонить» (confirm), «Summary» (clipboard).
- Подключено на `AttemptReviewPage` (header stack) и в колонке «Действия» таблицы `InterviewDetailsPage`.
- Company decision badge в колонке Review (`pending` скрывается).
- RTK mutations invalidates `Interview` tags для обновления таблицы/review queue.

**Verify:**
- `pnpm -C frontend eslint src/features/attempt-review` → exit 0
- `pnpm -C frontend build` → exit 0
- `pnpm -C backend build` → exit 0
