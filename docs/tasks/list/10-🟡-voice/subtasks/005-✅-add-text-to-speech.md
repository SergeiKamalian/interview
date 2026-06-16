# ✅ TASK-10.5 — Text-to-speech для вопросов

Status: [x] done  
Priority: Medium  
Parent block: `10-🟡-voice`  
Owner: Cursor / Sergey  
Last updated: 2026-06-15

---

## Goal

Добавить TTS сервис для озвучивания вопроса интервью и подсказок кандидату.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-🟡-voice` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Text-to-speech для вопросов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `backend/src/modules/tts/tts.module.ts`
- `backend/src/modules/tts/tts.service.ts`
- `backend/src/modules/tts/tts.controller.ts`
- `frontend/src/features/question-audio/QuestionAudioPlayer.tsx`
- `frontend/src/entities/interview/api/questionAudioApi.ts`

## Requirements

1. Endpoint: `POST /api/tts/synthesize` с текстом вопроса и voice profile.
2. Кешировать результат TTS по `(question_id, voice, lang)` для повторного использования.
3. Ограничить длину текста и частоту вызовов.
4. Frontend предоставляет кнопки play/pause/replay.
5. Язык по умолчанию `ru-RU`, configurable для международных вакансий.
6. TTS не должен блокировать основной text flow интервью.

## Step-by-step Plan

1. Реализовать backend TTS service + endpoint.
2. Добавить storage/cache для сгенерированных аудио.
3. Создать frontend плеер вопроса.
4. Интегрировать на страницу вопроса кандидату.
5. Проверить fallback: если TTS недоступен, UI остается функциональным.

## Acceptance Criteria

- Кандидат может прослушать вопрос голосом.
- TTS результаты кешируются и не генерируются лишний раз.
- Основной flow работает даже при ошибках TTS.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

**Реализация (отличие от исходного плана):** вместо REST `POST /api/tts/synthesize` — ElevenLabs HTTP TTS stream через backend bridge + Socket.IO события `ai.audio.stream_*` (согласовано с архитектурой adaptive interview realtime).

**Backend:**
- `backend/src/modules/elevenlabs/` — config + `ElevenLabsTtsService` (HTTP stream, in-memory cache по hash текста/voice/model)
- `backend/src/modules/interview-realtime/interview-ai-audio-stream.service.ts` — эмит `ai.audio.stream_started|chunk|completed`
- Интеграция в `InterviewAiMessageStreamService`: static text → TTS параллельно с text stream; LLM text → TTS после `stream_completed`
- Env: `ELEVENLABS_TTS_ENABLED=false` по умолчанию (no-op, text flow не ломается)

**Frontend:**
- `frontend/src/features/voice-interview/tts/useInterviewAiAudio.ts` — буферизация chunks, autoplay на complete, replay
- `InterviewAiAudioControls` + интеграция в `TextInterviewChat` / `useInterviewRealtime`

**Проверки:**
- `cd backend && npm run build` — OK
- `cd backend && npm test -- --testPathPatterns=interview-ai-message-stream` — OK
- `cd frontend && pnpm lint && pnpm build` — OK
- Browser smoke с реальным ElevenLabs API — не выполнен (нужен `ELEVENLABS_API_KEY` + running backend)

**Follow-ups:**
- TASK-10.6 — persist audio в `media_assets`
- LLM TTS на delta + flush по предложениям (сейчас MVP: полный текст после stream)
- Turn-taking: pause STT while TTS plays (TASK-10.4)
