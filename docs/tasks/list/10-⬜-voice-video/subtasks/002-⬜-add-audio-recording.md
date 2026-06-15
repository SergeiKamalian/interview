# ⬜ TASK-10.2 — Запись аудио ответа

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать запись аудио ответа через MediaRecorder с preview, перезаписью и ограничением длительности.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Запись аудио ответа» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `frontend/src/features/media-recording/audio/useAudioRecorder.ts`
- `frontend/src/features/media-recording/audio/AudioRecorderWidget.tsx`
- `frontend/src/features/media-recording/audio/audioRecorder.types.ts`
- `frontend/src/pages/public-interview/InterviewQuestionPage.tsx`

## Requirements

1. Форматы: предпочитать `audio/webm`; fallback по browser capability.
2. Максимальная длительность ответа конфигурируема (например 180 сек).
3. Состояния: idle, recording, paused(optional), recorded, uploading, error.
4. Показывать таймер и индикатор активности записи.
5. Поддержать `re-record` до отправки ответа.
6. Blob должен передаваться в upload feature без утечек памяти (revoke object URL).

## Step-by-step Plan

1. Создать hook для MediaRecorder lifecycle.
2. Собрать UI виджет записи с кнопками start/stop/retry.
3. Интегрировать ограничения времени и автозавершение.
4. Добавить playback preview перед отправкой.
5. Проверить работу в Chrome/Edge (минимум).

## Acceptance Criteria

- Аудио записывается и доступно для предпросмотра.
- Ограничение длительности работает стабильно.
- Пользователь может перезаписать ответ до отправки.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run test -- audio-recorder
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
