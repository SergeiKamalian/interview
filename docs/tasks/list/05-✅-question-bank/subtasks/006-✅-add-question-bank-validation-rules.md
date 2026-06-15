# ⬜ TASK-05.6 — Валидация question bank правил

Status: [x] done  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить backend-валидацию данных вопроса: диапазоны весов checkpoint, ограничения длины текстов и целостность good/bad examples.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Валидация question bank правил» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/src/modules/question-bank/validation/question-bank.validator.ts`
- `backend/src/modules/question-bank/dto/upsert-question.input.ts`
- `backend/src/modules/question-bank/question-bank.service.ts`

## Requirements

1. `prompt` min 30 / max 2000 символов.
2. Checkpoint weight > 0 и сумма весов = 100 (или нормализуется по правилу).
3. Минимум 1 checkpoint на вопрос.
4. Good/bad examples не пустые, max длина 1500.
5. `difficulty` только `junior|middle|senior`.

## Step-by-step Plan

1. Добавить class-validator декораторы в DTO.
2. Добавить доменные проверки в сервисе.
3. Покрыть негативные кейсы unit/integration тестами (optional).
4. Проверить, что GraphQL ошибки понятны frontend.

## Acceptance Criteria

- Невалидные вопросы не сохраняются.
- Сообщения ошибок пригодны для UI.
- Правила согласованы с будущим AI scoring.

## Checks

```bash
cd backend && npm run build
cd backend && npm run lint
```

## Completion Notes

- DTO class-validator: длины текстов, min 1 checkpoint, score > 0.
- `question-bank.validator.ts`: уникальность `checkpoint_key`, `SUM(score) = maxScore`.
- Правила по design doc (`max_score`, не weight=100).
