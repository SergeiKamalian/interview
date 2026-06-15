# ⬜ TASK-10.3 — Endpoint загрузки аудио

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить backend endpoint для загрузки аудио ответа кандидата с валидацией формата/размера и привязкой к interview answer.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Endpoint загрузки аудио» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `backend/src/modules/uploads/audio-upload.controller.ts`
- `backend/src/modules/uploads/uploads.module.ts`
- `backend/src/modules/uploads/services/audio-upload.service.ts`
- `backend/src/modules/uploads/dto/audio-upload.dto.ts`
- `backend/src/modules/interviews/graphql/submit-audio-answer.mutation.ts`

## Requirements

1. REST endpoint: `POST /api/uploads/audio` (multipart/form-data).
2. Параметры: `interviewId`, `questionId`, `candidateToken`, `audioFile`.
3. Валидация mime/type (`audio/webm`, `audio/mpeg`, `audio/wav`) и max size.
4. Ответ содержит `audioAssetId`, `storageKey`, `durationSec`.
5. Доступ только по валидному public interview token.
6. После upload создавать/обновлять link с `candidate_answers` записью.

## Step-by-step Plan

1. Создать controller и service для обработки multipart upload.
2. Добавить storage adapter (local/S3) для сохранения файла.
3. Добавить token проверку и rate limit для upload endpoint.
4. Интегрировать GraphQL mutation для фиксации ответа после upload.
5. Проверить upload happy path и invalid format path.

## Acceptance Criteria

- Аудио endpoint принимает валидные файлы и отвергает невалидные.
- Файл связывается с конкретным ответом интервью.
- Upload защищен public token проверкой.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- audio-upload
curl -X POST http://localhost:3000/api/uploads/audio -F "audioFile=@sample.webm" -F "interviewId=..." -F "questionId=..." -F "candidateToken=..."
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
