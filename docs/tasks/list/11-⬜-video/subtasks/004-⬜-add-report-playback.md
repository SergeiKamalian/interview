# ⬜ TASK-11.4 — Playback в отчете интервью

Status: [ ] todo  
Priority: Medium  
Parent block: `11-⬜-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить audio/video playback в dashboard report: рекрутер может прослушать/посмотреть ответ кандидата напрямую из отчета.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `11-⬜-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Playback в отчете интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `frontend/src/widgets/playback/AnswerMediaPlayer.tsx`
- `frontend/src/widgets/playback/AudioPlayer.tsx`
- `frontend/src/widgets/playback/VideoPlayer.tsx`
- `frontend/src/entities/media/api/mediaPlaybackApi.ts`
- `backend/src/modules/media/media-stream.controller.ts`

## Requirements

1. На report/details странице показывать media player рядом с transcript ответа.
2. Поддерживать как audio, так и video asset links.
3. Stream endpoint: `GET /api/media/:assetId/stream` с правовой проверкой company access.
4. UI состояния: loading, buffering, playback error, no media.
5. Плеер должен синхронизироваться с transcript section (optional jump-to-time).
6. Не отдавать публичные постоянные URL без авторизации.

## Step-by-step Plan

1. Добавить backend stream controller для signed/authorized media access.
2. Создать frontend unified media player виджет.
3. Интегрировать player в interview details и candidate report.
4. Добавить fallback сообщение при отсутствии media.
5. Проверить воспроизведение на разных браузерах и форматах.

## Acceptance Criteria

- Рекрутер может воспроизводить ответы из отчета без скачивания файла.
- Доступ к медиа защищен и scoped по компании.
- Playback UX стабилен для audio и video форматов.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test -- media-player
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
