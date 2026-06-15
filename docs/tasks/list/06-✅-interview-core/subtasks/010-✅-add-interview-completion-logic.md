# ⬜ TASK-06.10 — Логика завершения интервью

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить завершение interview attempt: явное `complete`, авто-завершение на последнем вопросе или по таймауту, фиксация итогового статуса и времени.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Логика завершения интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview-attempt/interview-attempt.service.ts`
- `backend/src/modules/interview-public/interview-public.resolver.ts`
- `backend/src/modules/interview/interview-status.service.ts`
- `frontend/src/pages/public/PublicInterviewCompletePage.tsx`

## Requirements

1. Mutation `completeInterviewAttempt(attemptId)`.
2. При завершении выставляются `status=completed`, `completed_at`.
3. Просроченные attempt переводятся в `expired` (cron/tick hook optional).
4. После completion отправка новых ответов запрещена.
5. Frontend показывает экран завершения и итоговый summary placeholder.

## Step-by-step Plan

1. Реализовать backend guard against post-completion submissions.
2. Добавить автозавершение когда `current_question_position > total`.
3. Сделать frontend страницу `/i/:token/complete`.
4. Проверить сценарии manual complete, auto complete и expired.

## Acceptance Criteria

- Attempt корректно завершает lifecycle.
- После завершения данные immutable.
- Система готова к подключению AI scoring в следующем блоке.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
