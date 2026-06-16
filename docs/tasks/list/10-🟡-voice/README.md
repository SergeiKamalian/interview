# 10-🟡-voice — Voice interview mode

## Цель блока

Добавить voice capabilities в public interview flow: разрешение микрофона, запись/загрузка аудио, speech-to-text, text-to-speech и audio playback в отчете.

## Контекст

Блоки 06–09 дают text/adaptive interview flow и AI evaluation по checkpoint-критериям. Блок 10 расширяет этот flow голосом: кандидат может отвечать аудио, backend принимает audio asset, STT превращает его в transcript, а существующий adaptive AI pipeline оценивает transcript как обычный candidate answer.

## Что входит в этот блок

- Frontend permission UX для микрофона.
- Запись аудио ответа в браузере через MediaRecorder API.
- Backend endpoint для upload аудио файлов.
- Storage metadata для audio media assets.
- Speech-to-text pipeline для конвертации аудио ответа в transcript text.
- Text-to-speech для озвучивания вопроса/подсказок кандидату.
- Audio playback блоки в candidate report/dashboard.
- Базовые ограничения форматов, размеров и длительности.
- Связь audio asset с interview answer entity.

## Что НЕ входит в этот блок

- Camera permission и video recording — отдельный блок `11-⬜-video`.
- Реалтайм WebRTC звонки и live interviewer presence.
- Продвинутый video moderation или facial analysis.
- CDN/edge optimization на production уровне.
- Mobile native SDK интеграции.

## Важные архитектурные решения

- Frontend: `features/media-permissions`, `features/media-recording`, `widgets/playback`.
- Backend REST endpoints: `/api/uploads/audio`, `/api/media/:id/stream`.
- Хранение файлов: S3-compatible bucket или локальный `uploads/` для dev.
- MySQL metadata tables из `docs/database/schemas/media-storage.md`: `media_assets`, `media_transcripts`.
- STT/TTS providers конфигурируются через env и сервисный слой.
- Transcript после STT становится входом для adaptive AI interview / final evaluation.

## Зависимости от предыдущих блоков

- Блок `02-✅-database-design`: design doc `docs/database/schemas/media-storage.md` — metadata таблицы для media assets.
- Блок `06-✅-interview-core`: public interview flow и ответы кандидата.
- Блок `07-✅-ai-evaluation`: AI evaluation (использует transcript).
- Блок `08-✅-dashboard-analytics`: report pages (для playback и отображения media).
- Блок `09-✅-adaptive-ai-interview`: live/adaptive flow, который сможет использовать STT transcript как answer text.
- Блок `01-✅-backend-foundation`: backend upload foundation и storage config.

## Ожидаемый результат после завершения блока

Кандидат может дать ответ голосом, audio надежно загружается и хранится, STT transcript попадает в существующий interview/evaluation flow, а в отчете рекрутера доступны transcript и audio playback.
