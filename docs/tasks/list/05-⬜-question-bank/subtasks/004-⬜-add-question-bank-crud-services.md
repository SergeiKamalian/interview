# ⬜ TASK-05.4 — CRUD-сервисы банка вопросов

Status: [ ] todo  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать backend service/repository слой для CRUD операций над question bank с транзакциями для checkpoints/examples.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «CRUD-сервисы банка вопросов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/src/modules/question-bank/question-bank.service.ts`
- `backend/src/modules/question-bank/question-bank.repository.ts`
- `backend/src/modules/question-bank/sql/` (optional query files)

## Requirements

1. Создание/обновление вопроса выполняется транзакционно: parent + child rows.
2. Update должен корректно синхронизировать checkpoints/examples (replace strategy или diff).
3. Archive меняет `status` на `archived`, без hard delete.
4. Repository использует подготовленные SQL параметры (без string concat).
5. Ошибки SQL маппятся в доменные исключения.

## Step-by-step Plan

1. Реализовать методы list/get/create/update/archive.
2. Добавить transaction helper для multi-table операций.
3. Интегрировать сервис в resolver.
4. Проверить edge-cases: пустые checkpoints, дубликаты позиций.

## Acceptance Criteria

- CRUD покрывает все операции GraphQL слоя.
- Транзакции предотвращают частичные апдейты.
- Архивация не удаляет исторические данные.

## Checks

```bash
cd backend && npm run build
cd backend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
