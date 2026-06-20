# TASK-19.18 — Decision audit history

Status: [x] done

## Goal

История «кто что решил и когда» — shortlist, verdict, reject, notes — для прозрачности команды.

## Scope

- UI timeline на `AttemptReviewPage` и/или modal «История решений».
- Data: `candidate_shortlist_events` + review events из TASK-19.10 (+ notes created events).
- Показ: actor (email/name), action, timestamp, optional payload snippet.
- Read-only; pagination если много events.

## Depends on

- TASK-19.10
- TASK-19.13 (decisions создают events)
- TASK-19.15 optional (note events)

## Verification

- shortlist → reject → agree verdict → 3 events в timeline в правильном порядке

## Completion Notes

**Backend**
- `attemptReviewDecisionHistory(attemptId, filters)` — UNION `interview_attempt_review_events` + `candidate_shortlist_events` с JOIN `users` (email, full_name), сортировка по `created_at DESC`, pagination.
- Команды: `pnpm run build` (backend), `pnpm test -- attempt-review.service.spec.ts` — 7 passed.

**GraphQL smoke (port 3001, fresh build)**
- Login: `test14@example.com` / `password123`
- Query `attemptReviewDecisionHistory(attemptId: "105")` → `total: 2`, events `ai_verdict_set` (agree) и `review_started`, actor `qamalyan2021@gmail.com` / `Sergey Arami Kamalyan`, порядок newest-first.
- Чужой tenant (company 10) на attempt 105 → `Interview attempt not found`.

**Frontend**
- `DecisionAuditTimeline` на `AttemptReviewPage`, pagination «Назад/Ещё».
- Команды: `pnpm graphql:sync`, `pnpm exec tsc -b`, `pnpm exec vite build` — OK.
