# ⬜ TASK-09.7 — Разрешение доступа к камере

Status: [ ] todo  
Priority: Medium  
Parent block: `09-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить обработку camera permission и UX-подсказки перед видеоответом кандидата.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 09 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `09-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Разрешение доступа к камере» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `frontend/src/features/media-permissions/camera/useCameraPermission.ts`
- `frontend/src/features/media-permissions/camera/CameraPermissionCard.tsx`
- `frontend/src/pages/public-interview/InterviewQuestionPage.tsx`

## Requirements

1. Использовать `getUserMedia({ video: true, audio: true })` для video mode.
2. Состояния аналогичны микрофону: granted/prompt/denied/unavailable.
3. Показывать live preview камеры перед стартом записи.
4. При denied разрешить fallback на audio/text.
5. Отключать камеру и освобождать stream tracks при unmount.
6. Не хранить видео локально дольше, чем нужно для upload.

## Step-by-step Plan

1. Создать hook разрешения камеры и preview stream.
2. Добавить UI карточку с инструкцией и fallback action.
3. Интегрировать в question page при выборе video ответа.
4. Проверить stop tracks при закрытии компонента.
5. Проверить denied flow и fallback переключение.

## Acceptance Criteria

- Камера запрашивается и обрабатывается корректно.
- Preview и fallback UX понятны кандидату.
- Нет утечек stream ресурсов.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run test -- camera-permission
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
