# ⬜ TASK-05.9 — Примеры хороших и плохих ответов

Status: [ ] todo  
Priority: Medium  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить хранение и выдачу good/bad answer examples для каждого вопроса, чтобы использовать их как reference в интервью и AI оценке.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Примеры хороших и плохих ответов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/src/modules/question-bank/types/question-answer-example.type.ts`
- `backend/src/modules/question-bank/question-bank.repository.ts`
- `frontend/src/entities/question/ui/QuestionExamples.tsx`
- `frontend/src/pages/dashboard/QuestionBankPage.tsx`

## Requirements

1. Таблица/тип поддерживает `kind=good|bad`.
2. Минимум по одному примеру каждого типа для активного вопроса (rule optional).
3. GraphQL отдаёт массив examples вместе с вопросом.
4. UI различает стили для good и bad примеров.

## Step-by-step Plan

1. Добавить выборку/сохранение examples в backend слое.
2. Расширить GraphQL response и frontend query.
3. Отрисовать блок примеров в карточке вопроса.
4. Проверить корректность данных после seed.

## Acceptance Criteria

- Примеры ответов доступны в API.
- UI показывает good/bad блоки отдельно.
- Question bank полностью пригоден как источник интервью-вопросов.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
