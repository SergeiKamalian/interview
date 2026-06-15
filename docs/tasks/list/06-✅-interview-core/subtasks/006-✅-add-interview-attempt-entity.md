# ⬜ TASK-06.6 — Сущность попытки интервью

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить таблицу `interview_attempts` для трекинга прогресса прохождения: старт, текущий вопрос, статус завершения, тайминги.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Сущность попытки интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/migrations/012_create_interview_attempts.sql`
- `backend/src/modules/interview-attempt/interview-attempt.module.ts`
- `backend/src/modules/interview-attempt/interview-attempt.service.ts`

## Requirements

1. Поля: `id`, `interview_id`, `candidate_id`, `status`, `started_at`, `completed_at`, `current_question_position`, `expires_at`.
2. Статусы: `in_progress|completed|expired|cancelled`.
3. Индекс на (`interview_id`, `candidate_id`, `status`).
4. Один активный `in_progress` attempt на кандидата (unique partial strategy через app logic).

## Step-by-step Plan

1. Создать миграцию и модуль attempt.
2. Добавить методы start/getActive/complete/expire.
3. Интегрировать с public token flow.
4. Проверить, что второй active attempt не создаётся.

## Acceptance Criteria

- Attempt lifecycle хранится в отдельной сущности.
- Активные попытки контролируются.
- Есть база для transcript и completion logic.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
