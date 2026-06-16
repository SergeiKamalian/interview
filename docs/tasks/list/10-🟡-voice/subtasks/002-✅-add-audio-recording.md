# ✅ TASK-10.2 — Запись аудио ответа

Status: [x] done  
Priority: High  
Parent block: `10-🟡-voice`  
Owner: Cursor / Sergey  
Last updated: 2026-06-15

---

## Completion Notes

- `frontend/src/features/media-recording/audio/useAudioRecorder.ts` — MediaRecorder lifecycle, timer, max 180s auto-stop, preview URL with revoke.
- `AudioRecorderWidget.tsx` — start/stop/re-record/submit UI integrated in `TextInterviewChat` when mic granted.
- MIME preference: `audio/webm;codecs=opus` with browser fallbacks.

Verification:

- `cd frontend && pnpm lint && pnpm build` — passed

Follow-up: pause/resume optional state not implemented (out of MVP scope).
