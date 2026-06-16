# 11-⬜-video — Video interview recording

## Цель блока

Добавить video capabilities после voice mode: разрешение камеры, запись видео ответа, upload/storage video assets и video playback в отчете.

## Контекст

Блок `10-🟡-voice` добавляет microphone/audio/STT/TTS и связывает transcript с существующим adaptive AI flow. Блок 11 расширяет этот слой видео: кандидат может записывать видеоответы, backend хранит video assets, а рекрутер может смотреть запись в отчете.

## Что входит в этот блок

- Frontend permission UX для камеры.
- Video recording в браузере через MediaRecorder API.
- Backend endpoint для upload видео файлов.
- Storage metadata для video media assets.
- Video playback в candidate report/dashboard.
- Базовые ограничения форматов, размеров и длительности.
- Связь video asset с interview attempt/message.

## Что НЕ входит в этот блок

- Speech-to-text и text-to-speech — это блок `10-🟡-voice`.
- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation, facial analysis и proctoring.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Важные архитектурные решения

- Frontend: `features/media-permissions`, `features/media-recording`, `widgets/playback`.
- Backend REST endpoints: `/api/uploads/video`, `/api/media/:id/stream`.
- Хранение файлов: S3-compatible bucket или локальный `uploads/` для dev.
- MySQL metadata tables из `docs/database/schemas/media-storage.md`: `media_assets`.
- Video не участвует в AI scoring на первом этапе; оценка остается по transcript/checkpoints.

## Зависимости от предыдущих блоков

- Блок `02-✅-database-design`: design doc `docs/database/schemas/media-storage.md`.
- Блок `08-✅-dashboard-analytics`: report pages.
- Блок `10-🟡-voice`: shared media permission/recording/playback foundation.

## Ожидаемый результат после завершения блока

Кандидат может записать video answer, видео надежно загружается и хранится, а в отчете рекрутера доступен video playback без влияния на checkpoint-based AI scoring.
