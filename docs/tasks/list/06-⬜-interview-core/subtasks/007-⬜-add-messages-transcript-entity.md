# ⬜ TASK-06.7 — Сущность transcript сообщений

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить таблицу `messages_transcript` для сохранения истории вопросов/ответов text interview в рамках `interview_attempt`.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Сущность transcript сообщений» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/migrations/013_create_messages_transcript.sql`
- `backend/src/modules/transcript/transcript.module.ts`
- `backend/src/modules/transcript/transcript.repository.ts`
- `backend/src/modules/transcript/types/transcript-message.type.ts`

## Requirements

1. Поля: `id`, `attempt_id`, `role` (`system|interviewer|candidate`), `question_id` optional, `content`, `position`, `created_at`.
2. Индекс на (`attempt_id`, `position`).
3. Content max length ограничен (например 5000).
4. Сообщения immutable после записи (update не требуется).

## Step-by-step Plan

1. Создать миграцию таблицы transcript.
2. Реализовать append/list методы в repository.
3. Добавить сервисную валидацию длины контента.
4. Проверить сортировку по position и консистентность sequence.

## Acceptance Criteria

- История диалога сохраняется пошагово.
- Данные готовы для анализа и AI scoring.
- Порядок сообщений стабилен.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
