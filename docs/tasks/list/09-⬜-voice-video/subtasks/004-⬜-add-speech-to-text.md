# ⬜ TASK-09.4 — Speech-to-text транскрибация

Status: [ ] todo  
Priority: High  
Parent block: `09-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать STT pipeline: конвертировать загруженное аудио в текст transcript и сохранять результат для AI evaluation.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 09 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `09-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Speech-to-text транскрибация» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `backend/src/modules/stt/stt.module.ts`
- `backend/src/modules/stt/stt.service.ts`
- `backend/src/modules/stt/stt.config.ts`
- `backend/src/modules/uploads/services/audio-upload.service.ts`
- `backend/src/modules/interviews/repositories/candidate-answer.repository.ts`

## Requirements

1. После успешной загрузки аудио запускается STT job (sync или async queue).
2. STT provider и модель конфигурируются env (`STT_PROVIDER`, `STT_MODEL`, `STT_API_KEY`).
3. Результат сохраняется в `candidate_answers.transcript_text` и optional segments table.
4. Поддержать статус транскрибации: `pending`, `completed`, `failed`.
5. При провале STT кандидат может вручную ввести текст как fallback.
6. Транскрипт используется дальше в AI evaluation блоке 06 как source text.

## Step-by-step Plan

1. Создать STT module/service и подключить provider client.
2. Интегрировать вызов STT после audio upload completion.
3. Сохранить transcript и статус в answer storage.
4. Добавить retry policy для временных ошибок STT API.
5. Проверить pipeline на тестовом аудио файле.

## Acceptance Criteria

- Аудио ответ автоматически преобразуется в текст.
- Статусы STT прозрачно отслеживаются.
- AI evaluation получает transcript без ручной доработки.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- stt
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
