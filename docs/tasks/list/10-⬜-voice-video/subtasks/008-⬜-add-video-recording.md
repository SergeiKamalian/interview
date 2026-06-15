# ⬜ TASK-10.8 — Запись видео ответа

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать запись видео ответа (с аудио) через MediaRecorder с предпросмотром и контролем длительности.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Запись видео ответа» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `frontend/src/features/media-recording/video/useVideoRecorder.ts`
- `frontend/src/features/media-recording/video/VideoRecorderWidget.tsx`
- `frontend/src/features/media-recording/video/videoRecorder.types.ts`
- `frontend/src/pages/public-interview/InterviewQuestionPage.tsx`

## Requirements

1. Форматы: `video/webm` приоритетно, fallback по поддержке браузера.
2. Max duration configurable (например 240 сек).
3. UI показывает preview, timer, start/stop/re-record.
4. Поддержка muted local preview во время записи.
5. После завершения запись передается в upload pipeline.
6. Обрабатывать отсутствие MediaRecorder API с понятным fallback.

## Step-by-step Plan

1. Создать hook для video recorder lifecycle.
2. Реализовать компонент с preview и контролами.
3. Интегрировать ограничение длительности и автозавершение.
4. Связать компонент с upload mutation.
5. Проверить качество/размер файлов на типичном сценарии.

## Acceptance Criteria

- Видеоответ записывается и доступен для отправки.
- Ограничения времени и перезапись работают.
- Fallback сценарии покрыты.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run test -- video-recorder
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
