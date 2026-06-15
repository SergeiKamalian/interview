# ⬜ TASK-06.4 — Выбор вопросов из банка

Status: [ ] todo  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать backend/frontend механизм выбора вопросов из question bank при создании интервью с фильтрами и предпросмотром.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Выбор вопросов из банка» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/src/modules/interview/interview-question-selection.service.ts`
- `backend/src/modules/question-bank/question-bank.resolver.ts` (filters)
- `frontend/src/features/interview-create/ui/QuestionPicker.tsx`
- `frontend/src/features/interview-create/model/useQuestionSelection.ts`

## Requirements

1. Фильтры по category, difficulty, status=active.
2. Пагинация/поиск по title для удобного выбора.
3. Нельзя добавить один и тот же вопрос дважды.
4. Порядок можно менять drag/drop (optional) или up/down controls.
5. Итоговый payload сохраняет positions.

## Step-by-step Plan

1. Расширить query questionBank filters на backend.
2. Создать QuestionPicker компонент с чекбоксами.
3. Добавить state selectedQuestions и reorder.
4. Интегрировать с `createInterview` mutation.

## Acceptance Criteria

- Рекрутер выбирает вопросы из source-of-truth банка.
- Дубликаты исключены.
- Порядок вопросов передаётся в backend корректно.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
