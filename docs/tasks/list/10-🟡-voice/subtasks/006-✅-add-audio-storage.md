# ✅ TASK-10.6 — Хранение аудио-артефактов

Status: [x] done  
Priority: High  
Parent block: `10-🟡-voice`  
Owner: Cursor / Sergey  
Last updated: 2026-06-15

---

## Completion Notes

- Uses existing migration `008_create_media_storage.sql` (`media_assets` table).
- `backend/src/modules/media/` — repository, local storage service, asset service.
- Files saved under `storage/media/attempts/{attemptId}/`.
- `GET /api/files/:mediaAssetId?publicToken=&attemptId=` — stream download for candidate session.
- Metadata persisted on upload; linked to `interview_messages` on answer submit.

Verification:

- `cd backend && npm run build` — passed
- `cd backend && npm test -- --testPathPatterns=audio-upload` — passed

Follow-up: S3 provider abstraction stubbed via `storage_bucket=local`; TTS audio persistence deferred.
