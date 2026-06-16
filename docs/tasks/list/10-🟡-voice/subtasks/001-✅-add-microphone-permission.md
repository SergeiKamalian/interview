# ✅ TASK-10.1 — Разрешение доступа к микрофону

Status: [x] done  
Priority: High  
Parent block: `10-🟡-voice`  
Owner: Cursor / Sergey  
Last updated: 2026-06-15

---

## Completion Notes

- `useMicrophonePermission` — states `granted|prompt|denied|unavailable`, user-triggered `getUserMedia`.
- `MicrophonePermissionCard` — explicit permission UX + denied instructions; supports external hook state for shared session state with recorder.
- Integrated in `TextInterviewChat`; text answer remains fallback.

Verification:

- `cd frontend && pnpm lint` — passed
- `cd frontend && pnpm build` — passed

Manual browser smoke with live session remains recommended when backend is running.
