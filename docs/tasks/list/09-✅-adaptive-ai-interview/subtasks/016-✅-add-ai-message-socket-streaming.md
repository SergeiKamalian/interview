# TASK-09.16 — Streaming AI-сообщений через WebSocket

Status: [x] done

## Goal

Показывать кандидату AI-сообщения (follow-up и следующий main question) **по частям** через Socket.IO, а не ждать полный текст до конца GraphQL submit.

GraphQL остаётся command + final snapshot; WebSocket доставляет stream deltas в реальном времени.

## Scope

### In scope

- Новые socket events: `ai.message.stream_started`, `ai.message.stream_delta`, `ai.message.stream_completed`
- OpenAI-compatible **SSE streaming** (`stream: true`) для LLM follow-up (`ADAPTIVE_FOLLOW_UP_USE_LLM=true`)
- Chunked streaming для template follow-up и next main question (typewriter UX без LLM)
- Frontend: placeholder bubble + накопление `contentSoFar`, cursor во время stream
- Feature flag: `ADAPTIVE_AI_MESSAGE_STREAMING=true` (только при `ADAPTIVE_INTERVIEW_ENABLED=true`)
- Idempotent finalize: после stream → DB commit → `message.appended` как сейчас

### Out of scope

- Streaming per-turn checkpoint evaluation (JSON, internal)
- STT/TTS / voice-video block
- Streaming final evaluation report
- Socket submit (answer остаётся через GraphQL mutation)

## Architecture

```txt
GraphQL submitAnswer
  → save candidate message
  → evaluate_turn (blocking, internal JSON)
  → plan_follow_up
       → stream_started { streamId, messageKind }
       → stream_delta × N { streamId, delta, contentSoFar }
       → stream_completed { streamId, content }
       → persist follow_up + interview_message
  → message.appended { messageId }
  → GraphQL response
```

Reconnect: client делает `interviewSession` refetch; partial stream не восстанавливается (MVP).

## Event payload

Расширение `interview.event`:

```json
{
  "eventType": "ai.message.stream_delta",
  "attemptId": "5",
  "interviewQuestionId": "10",
  "messageKind": "follow_up_question",
  "stream": {
    "streamId": "uuid",
    "delta": "Можете ",
    "contentSoFar": "Можете "
  }
}
```

Public-safe: без ideal answer, checkpoint expected, internal rationale.

## Backend files

- `ai-provider.service.ts` — `streamChatCompletion()` SSE parser
- `interview-realtime/types/` — новые event types + `stream` payload
- `interview-realtime/interview-ai-message-stream.service.ts` — orchestration
- `follow-up-planner.service.ts` — LLM/static stream перед persist
- `adaptive-interview-submit.service.ts` — stream next main question
- `adaptive-interview-context.config.ts` — `isAiMessageStreamingEnabled()`

## Frontend files

- `shared/api/realtime/types.ts` — stream types + phases
- `useInterviewRealtime.ts` — `streamingMessage` state
- `TextInterviewChat.tsx` — streaming bubble + cursor
- `PublicInterviewSessionPage.tsx` — merge streaming + snapshot messages

## Env

```env
ADAPTIVE_AI_MESSAGE_STREAMING=true
ADAPTIVE_FOLLOW_UP_USE_LLM=false   # template chunks by default
ADAPTIVE_FOLLOW_UP_USE_LLM=true    # real OpenAI SSE stream for follow-up text
```

## Verification

- [x] `pnpm --dir backend run test && build` — 28 suites, 71 tests
- [x] `pnpm --dir frontend run lint && build`
- [ ] Manual: submit answer → follow-up/main question появляется по частям в chat bubble

## Completion Notes

- Backend: `InterviewAiMessageStreamService`, OpenAI SSE `streamChatCompletion`, events `ai.message.stream_*`
- Template/main question: chunked static stream (~12ms/chunk)
- LLM follow-up (`ADAPTIVE_FOLLOW_UP_USE_LLM=true`): plain-text SSE stream
- Frontend: `streamingMessage` в `useInterviewRealtime`, bubble с cursor в `TextInterviewChat`
- Env: `ADAPTIVE_AI_MESSAGE_STREAMING=true` (requires `ADAPTIVE_INTERVIEW_ENABLED=true`)
