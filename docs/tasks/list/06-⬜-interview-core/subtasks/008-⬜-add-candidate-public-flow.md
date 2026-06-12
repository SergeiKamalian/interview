# ⬜ TASK-06.8 — Публичный flow кандидата

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать public GraphQL flow: кандидат открывает ссылку по token, вводит данные, стартует попытку и получает первый вопрос.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Публичный flow кандидата» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview-public/interview-public.resolver.ts`
- `backend/src/modules/interview-public/interview-public.service.ts`
- `backend/src/modules/interview-public/dto/start-public-interview.input.ts`
- `frontend/src/pages/public/PublicInterviewStartPage.tsx`
- `frontend/src/features/public-interview/api/publicInterviewApi.ts`

## Requirements

1. Query `publicInterview(token)` возвращает мета-информацию (title, company name masked policy).
2. Mutation `startPublicInterview(input)` создаёт/находит candidate + attempt.
3. Публичные операции не требуют JWT recruiter.
4. Только для `interviews.status = published`.
5. Rate-limit и антиспам можно зафиксировать как TODO.

## Step-by-step Plan

1. Создать public resolver и service слой.
2. Добавить frontend страницу `/i/:token` для старта.
3. Собрать форму кандидата (name/email).
4. После старта редиректить в text interview screen.

## Acceptance Criteria

- Кандидат может начать интервью по публичному токену.
- Неправильный/закрытый токен корректно отклоняется.
- Attempt создаётся и готов к диалогу.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
