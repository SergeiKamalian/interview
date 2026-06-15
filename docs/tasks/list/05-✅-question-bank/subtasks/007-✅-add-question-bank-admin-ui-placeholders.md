# ⬜ TASK-05.7 — Admin UI placeholders для банка

Status: [x] done  
Priority: Medium  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать в dashboard базовые заглушки UI для раздела question bank: список, фильтры, кнопка создания, пустые состояния.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Admin UI placeholders для банка» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `frontend/src/pages/dashboard/QuestionBankPage.tsx`
- `frontend/src/features/question-bank/api/questionBankApi.ts`
- `frontend/src/widgets/question-bank/QuestionBankTable.tsx`
- `frontend/src/app/router/routes.tsx`

## Requirements

1. Маршрут `/dashboard/questions` доступен только auth user.
2. Выводить список вопросов (title, category, difficulty, status).
3. Placeholder кнопки: `Создать вопрос`, `Редактировать`.
4. Показ loading/empty/error state.
5. Данные грузятся через RTK Query GraphQL endpoint.

## Step-by-step Plan

1. Добавить route и страницу QuestionBankPage.
2. Создать api slice endpoints для list query.
3. Сверстать таблицу-заглушку и фильтры.
4. Проверить визуально в dev server.

## Acceptance Criteria

- В dashboard есть рабочая навигация в question bank.
- Список вопросов отображается из backend.
- UI готов к дальнейшему CRUD-расширению.

## Checks

```bash
cd frontend && npm run build
cd frontend && npm run lint
```

## Completion Notes

- Route `/dashboard/questions` (protected), nav link в `DashboardLayout`.
- `QuestionBankPage` + `QuestionBankTable`, RTK Query `useQuestionBankQuery`.
- Loading / empty / error states, placeholder кнопка «Создать вопрос».
- `npm run build` + `npm run lint` (frontend) → OK.
