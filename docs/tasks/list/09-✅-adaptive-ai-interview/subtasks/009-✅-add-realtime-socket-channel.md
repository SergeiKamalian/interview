# TASK-09.9 — Добавить realtime WebSocket channel

Status: [x] done

## Completion Notes

- Backend gateway files: `backend/src/modules/interview-realtime/` (`interview-realtime.module.ts`, `interview-realtime.gateway.ts`, `interview-realtime.service.ts`, `types/interview-realtime-event.types.ts`)
- Frontend realtime files: `frontend/src/shared/api/realtime/`, `frontend/src/features/public-interview/model/useInterviewRealtime.ts`
- Event contract implemented: `answer.received`, `ai.evaluation_started`, `ai.follow_up_planned`, `message.appended`, `question.completed`, `attempt.completed`, `evaluation.ready`, `adaptive.error_recovered` via `interview.event` payload
- Reconnect/resync smoke: socket join `attempt:{id}` OK on port 3002; invalid token → `JOIN_DENIED`; frontend refetch on reconnect
- Known limitations: no durable outbox table (MVP); events emitted in-process after DB commit only

## Verification

- `pnpm --dir backend run test -- interview-realtime` → passed
- `pnpm --dir backend run build` → OK
- `pnpm --dir frontend run build` → OK
- Manual: `socket.io-client` join with valid `publicToken` + `attemptId` → `interview.joined`
