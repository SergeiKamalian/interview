# ⬜ TASK-10.1 — Разрешение доступа к микрофону

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить UX для запроса и обработки разрешения микрофона в public interview flow.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Разрешение доступа к микрофону» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `frontend/src/features/media-permissions/microphone/useMicrophonePermission.ts`
- `frontend/src/features/media-permissions/microphone/MicrophonePermissionCard.tsx`
- `frontend/src/pages/public-interview/InterviewQuestionPage.tsx`

## Requirements

1. Использовать `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. Обрабатывать состояния: `granted`, `prompt`, `denied`, `unavailable`.
3. Показывать понятные инструкции при denied (browser settings).
4. Не запрашивать разрешение заранее без действия пользователя.
5. Сохранять permission state в локальном UI store на сессию.
6. Fallback на text answer при недоступном микрофоне.

## Step-by-step Plan

1. Создать hook `useMicrophonePermission`.
2. Добавить карточку запроса разрешения перед началом аудио ответа.
3. Интегрировать state в страницу вопроса интервью.
4. Проверить сценарии grant/deny/blocked.
5. Добавить e2e smoke test для отображения fallback.

## Acceptance Criteria

- Кандидат явно понимает статус микрофона.
- Flow не ломается при denied permission.
- Есть рабочий fallback на текстовый ответ.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run test -- microphone-permission
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
