# ⬜ TASK-11.3 — Загрузка и хранение видео

Status: [ ] todo  
Priority: High  
Parent block: `11-⬜-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить backend endpoint загрузки видео и metadata storage, аналогично аудио, с учетом больших файлов.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `11-⬜-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Загрузка и хранение видео» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `backend/src/modules/uploads/video-upload.controller.ts`
- `backend/src/modules/uploads/services/video-upload.service.ts`
- `backend/migrations/0zd_create_video_assets.sql`
- `backend/src/modules/media/repositories/video-asset.repository.ts`
- `backend/src/modules/media/entities/video-asset.entity.ts`

## Requirements

1. Endpoint: `POST /api/uploads/video` (multipart/form-data).
2. Ограничить mime/type (`video/webm`, `video/mp4`) и max size (например 200MB).
3. Таблица `video_assets`: `id`, `interview_id`, `candidate_answer_id`, `storage_key`, `mime_type`, `size_bytes`, `duration_sec`, `thumbnail_key`, `created_at`.
4. Поддержать chunked upload strategy (optional) или увеличить timeout для крупных файлов.
5. Сохранять связь video asset с candidate answer.
6. Доступ к video stream только по авторизованному запросу или signed URL.

## Step-by-step Plan

1. Создать controller/service для video upload.
2. Добавить SQL-миграцию `video_assets` и repository.
3. Интегрировать storage provider upload + metadata insert.
4. Добавить генерацию thumbnail (optional background job).
5. Проверить upload большого файла и обработку timeout/error.

## Acceptance Criteria

- Видеофайлы загружаются и сохраняются с metadata.
- Есть надежная связь видео с ответом кандидата.
- Система корректно обрабатывает большие файлы.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- video-upload
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
