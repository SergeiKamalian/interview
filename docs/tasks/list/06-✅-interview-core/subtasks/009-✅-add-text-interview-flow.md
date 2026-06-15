# ⬜ TASK-06.9 — Text interview flow

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать основной текстовый сценарий: выдача текущего вопроса, отправка ответа кандидатом, переход к следующему вопросу с записью transcript.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Text interview flow» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview-public/interview-text-flow.service.ts`
- `backend/src/modules/interview-public/interview-public.resolver.ts`
- `frontend/src/pages/public/PublicInterviewSessionPage.tsx`
- `frontend/src/features/public-interview/ui/TextInterviewChat.tsx`

## Requirements

1. Mutation `submitInterviewAnswer(attemptId, answer)`.
2. Query `currentInterviewQuestion(attemptId)`.
3. После ответа `current_question_position` инкрементируется.
4. Каждый шаг пишет записи в `messages_transcript` (`interviewer` вопрос + `candidate` ответ).
5. Если вопросы закончились, flow переводит attempt в completion pending.

## Step-by-step Plan

1. Реализовать сервис переходов между вопросами.
2. Синхронизировать запись transcript и state attempt в транзакции.
3. Создать frontend экран чата/формы ответа.
4. Обработать reload страницы и восстановление текущего шага.

## Acceptance Criteria

- Кандидат проходит вопросы последовательно.
- Ответы сохраняются в transcript.
- Flow устойчив к перезагрузке страницы.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
