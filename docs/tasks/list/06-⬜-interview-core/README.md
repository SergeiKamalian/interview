# 06-⬜-interview-core — Ядро интервью

## Цель блока

Собрать core-домен интервью: сущности interview/candidate/attempt/transcript, публичный токен-доступ кандидата, выбор вопросов из question bank и базовая логика прохождения/завершения text interview.

## Контекст

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

## Что входит в этот блок

- MySQL схема interview-домена и SQL миграции.
- Создание interview из dashboard c выбором вопросов из банка.
- Публичный токен интервью и endpoint/GraphQL flow для кандидата.
- Сущности candidate, interview_attempt, messages_transcript.
- Public candidate flow (start -> answer -> complete).
- Text interview flow без voice/video.
- Базовые статусы и completion logic (timeout/manual complete).

## Что НЕ входит в этот блок

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Важные архитектурные решения

- Question bank — единый source of truth; interview хранит snapshot связей через junction tables.
- NestJS GraphQL для recruiter API и public candidate API (разделение по токену/guard).
- MySQL raw SQL migrations: `interviews`, `interview_questions`, `candidates`, `interview_attempts`, `messages_transcript`.
- Публичный доступ по `public_token` без auth account кандидата.
- Frontend React Vite RTK Query: dashboard flow и public flow на отдельных маршрутах.
- Статусы: interview (`draft|published|closed`), attempt (`in_progress|completed|expired`).

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/interview-core.md` — схема interviews/candidates/attempts/messages должна быть спроектирована до SQL migrations.
- Блок `04-⬜-auth-company`: recruiter auth и company scoping.
- Блок `05-⬜-question-bank`: question bank данные и API.
- Блок `03-⬜-frontend-foundation`: router/layouts/RTK Query foundation для frontend flows.

## Ожидаемый результат после завершения блока

Рекрутер создаёт интервью из банка вопросов, кандидат открывает публичную ссылку по токену, проходит текстовый сценарий, ответы пишутся в transcript, attempt корректно завершается со статусом и метаданными.
