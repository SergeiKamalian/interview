# TASK-19.16 — Shareable candidate review link

Status: [x] done

## Goal

Ссылка «посмотри этого кандидата», которую можно скинуть коллеге **без полного dashboard-доступа** — открывает read-only review/summary.

## Scope

- Design: tokenized share link (expiry, revoke, scope = single attempt).
- Backend: REST download или GraphQL public/share route с token; **не** открывать весь tenant.
- UI: кнопка «Поделиться» на AttemptReviewPage → copy link + optional expiry.
- Read-only view: score, recommendation, summary, strengths/risks; без transcript или с redacted transcript — решить в design (default: summary-only для безопасности).
- Revoke/regenerate link.

## Depends on

- TASK-19.3 ✅ (attempt review page content)

## Out of scope

- Полноценный guest auth / team roles
- ATS export

## Verification

- создать link → открыть в incognito → виден summary
- revoke → 404/403
- чужой token → denied

## Completion Notes

**Команды:**
- `cd backend && pnpm run build` → OK
- `cd backend && pnpm test -- attempt-review` → 10 passed (включая `attempt-share.service.spec.ts` 3 кейса)
- `cd backend && pnpm run migrate` → schema up to date (026 applied)
- `PORT=3010 node dist/main` + `curl http://localhost:3010/api/public/attempt-share/invalid-token-test` → HTTP 404, message `Share link not found` (ожидали denied для невалидного token)
- `cd frontend && pnpm run graphql:sync && pnpm run build` → OK

**Поведение:**
- DB: `026_interview_attempt_share_tokens.sql` — token, optional `expires_at`, `revoked_at`
- GraphQL (auth): `attemptShareLink`, `createAttemptShareLink`, `revokeAttemptShareLink`
- REST public: `GET /api/public/attempt-share/:token` — summary-only (no transcript/email)
- UI: `AttemptShareDialog` на AttemptReviewPage; public route `/share/:token`

**Ручная проверка (после рестарта backend на :3000):**
1. Открыть attempt review → «Поделиться» → создать ссылку → скопировать
2. Incognito `/share/<token>` → summary, score, strengths/risks
3. Отозвать → incognito 404
