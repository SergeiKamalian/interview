# ✅ TASK-10.3 — Endpoint загрузки аудио

Status: [x] done  
Priority: High  
Parent block: `10-🟡-voice`  
Owner: Cursor / Sergey  
Last updated: 2026-06-15

---

## Completion Notes

- `POST /api/uploads/audio` (multipart): `publicToken`, `attemptId`, `audioFile`, optional `durationSec`.
- Validates public attempt token, mime (`audio/webm|mpeg|wav|ogg|mp4`), max size.
- Returns `{ mediaAssetId, storageKey, mimeType, fileSizeBytes, durationSec }`.
- GraphQL `submitInterviewAnswer` extended with optional `mediaAssetId`; links asset to candidate message after save.
- Voice-only submit uses placeholder text on backend when answer empty.

Verification:

- `cd backend && npm run build` — passed
- `cd backend && npm test -- --testPathPatterns=audio-upload` — 2 tests passed
- `cd frontend && pnpm build` — passed (upload via `/api` proxy)

Follow-up: rate limiting not added (optional hardening).
