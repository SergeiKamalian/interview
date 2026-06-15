# ⬜ TASK-05.8 — Поддержка весов checkpoint

Status: [x] done  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить явную поддержку весов checkpoint в API и UI, чтобы каждый вопрос имел прозрачную структуру оценивания.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Поддержка весов checkpoint» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/src/modules/question-bank/types/question-checkpoint.type.ts`
- `backend/src/modules/question-bank/question-bank.service.ts`
- `frontend/src/entities/question/model/types.ts`
- `frontend/src/pages/dashboard/QuestionBankPage.tsx`

## Requirements

1. Каждый checkpoint содержит `label`, `weight`, `position`.
2. Сумма weights валидируется (100).
3. GraphQL выдаёт checkpoints в сортировке по `position`.
4. UI показывает веса рядом с checkpoint label.

## Step-by-step Plan

1. Обновить SQL select/insert/update для checkpoint fields.
2. Расширить GraphQL типы и frontend модели.
3. Отобразить веса на странице вопроса/таблицы.
4. Проверить корректную сортировку.

## Acceptance Criteria

- Весовые коэффициенты доступны end-to-end.
- Порядок checkpoint стабилен.
- Данные готовы для scoring блока 06.

## Checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Completion Notes

- GraphQL `QuestionCheckpointType.score` + `sortOrder`, сортировка по `sort_order`.
- UI показывает веса (`N pts`) рядом с checkpoint title в детальной карточке.
- End-to-end проверено через `questionBank` query (useEffect: 5 checkpoints × 1 pt).
