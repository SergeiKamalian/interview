# 10-⬜-voice-video — Voice и video интервью

## Цель блока

Добавить voice/video capabilities в public interview flow: разрешения устройства, запись/загрузка медиа, speech-to-text, text-to-speech и воспроизведение в отчете.

## Контекст

Блок 06 дает text flow интервью, блок 07 — AI evaluation. Блок 10 расширяет UX: кандидат может отвечать голосом/видео, backend принимает и сохраняет медиа, транскрибирует в текст и связывает артефакты с answer/report.

## Что входит в этот блок

- Frontend permissions для микрофона и камеры.
- Аудио и видео запись в браузере через MediaRecorder API.
- Backend endpoints для upload аудио/видео файлов.
- Storage metadata таблицы для media assets.
- Speech-to-text pipeline для конвертации аудио ответа в transcript text.
- Text-to-speech для озвучивания вопроса/подсказок кандидату.
- Playback блоки в candidate report/dashboard.
- Базовые ограничения форматов, размеров и длительности.
- Связь media assets с interview answer entity.

## Что НЕ входит в этот блок

- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Важные архитектурные решения

- Frontend: `features/media-recording`, `features/media-permissions`, `widgets/playback`.
- Backend REST endpoints: `/api/uploads/audio`, `/api/uploads/video`, `/api/media/:id/stream`.
- Хранение файлов: S3-compatible bucket или локальный `uploads/` для dev.
- MySQL metadata tables: `audio_assets`, `video_assets`, `answer_media_links`.
- STT/TTS providers конфигурируются через env и сервисный слой.
- Transcript после STT становится входом для adaptive AI interview / final evaluation.

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/media-storage.md` — metadata таблицы для audio/video.
- Блок `06-⬜-interview-core`: public interview flow и ответы кандидата.
- Блок `07-✅-ai-evaluation`: AI evaluation (использует transcript).
- Блок `08-✅-dashboard-analytics`: report pages (для playback и отображения media).
- Блок `09-✅-adaptive-ai-interview`: live/adaptive flow, который сможет использовать STT transcript как answer text.
- Блок `01-🟡-backend-foundation`: backend upload foundation и storage config.

## Ожидаемый результат после завершения блока

Кандидат может дать ответ голосом или видео, медиа надежно загружается и хранится, аудио транскрибируется, а в отчете рекрутера доступны transcript и playback.
