# ⬜ TASK-10.6 — Хранение аудио-артефактов

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-voice-video`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить persistent storage metadata для аудио файлов и связь с интервью/ответами.

## Context

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

Эта подзадача — часть блока `10-⬜-voice-video` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Хранение аудио-артефактов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Files / Folders Allowed

- `backend/migrations/0zc_create_audio_assets.sql`
- `backend/src/modules/media/repositories/audio-asset.repository.ts`
- `backend/src/modules/media/media-storage.service.ts`
- `backend/src/modules/media/entities/audio-asset.entity.ts`

## Requirements

1. Таблица `audio_assets`: `id`, `interview_id`, `candidate_answer_id`, `storage_provider`, `storage_key`, `mime_type`, `size_bytes`, `duration_sec`, `created_at`.
2. Индексы по `interview_id`, `candidate_answer_id`.
3. Storage provider abstraction: local dev / S3 prod.
4. При удалении интервью должны чиститься orphan links (soft delete strategy optional).
5. Хранить только metadata в БД, бинарные данные в object storage.
6. Доступ к asset по signed URL или stream endpoint с проверкой прав.

## Step-by-step Plan

1. Добавить SQL-миграцию audio assets.
2. Создать repository и media storage service.
3. Интегрировать запись metadata при upload аудио.
4. Добавить сервис генерации временных signed URLs.
5. Проверить доступ к файлу только авторизованным сторонам.

## Acceptance Criteria

- Аудио metadata надежно хранится в БД.
- Физические файлы хранятся в объектном storage.
- Доступ к аудио контролируется правами и токенами.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- audio-asset
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
