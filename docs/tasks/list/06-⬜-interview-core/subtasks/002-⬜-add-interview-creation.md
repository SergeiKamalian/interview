# ⬜ TASK-06.2 — Создание интервью рекрутером

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать GraphQL mutation создания интервью с выбором списка вопросов из question bank и сохранением порядка.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Создание интервью рекрутером» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview/interview.module.ts`
- `backend/src/modules/interview/interview.resolver.ts`
- `backend/src/modules/interview/interview.service.ts`
- `backend/src/modules/interview/dto/create-interview.input.ts`
- `frontend/src/features/interview-create/api/interviewCreateApi.ts`

## Requirements

1. Mutation `createInterview(input)` доступна авторизованному recruiter.
2. Input: `title`, `description`, `questionIds[]`.
3. Проверять, что все `questionIds` принадлежат той же company.
4. Вставка interview + interview_questions в транзакции.
5. Ответ возвращает `id`, `status`, `publicToken` (можно скрыть до publish по политике).

## Step-by-step Plan

1. Создать service/repository для create flow.
2. Добавить guard и company-scoping проверки.
3. Сделать frontend endpoint для вызова mutation.
4. Проверить happy-path и чужие question ids.

## Acceptance Criteria

- Рекрутер может создать interview из question bank.
- Порядок вопросов сохраняется.
- Нарушение company scope блокируется.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
