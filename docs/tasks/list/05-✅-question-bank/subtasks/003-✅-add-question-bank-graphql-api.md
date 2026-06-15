# ⬜ TASK-05.3 — GraphQL API банка вопросов

Status: [x] done  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить GraphQL типы и resolver-операции для чтения списка вопросов, детальной карточки и базовых mutation операций.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «GraphQL API банка вопросов» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/src/modules/question-bank/question-bank.module.ts`
- `backend/src/modules/question-bank/question-bank.resolver.ts`
- `backend/src/modules/question-bank/types/question.type.ts`
- `backend/src/modules/question-bank/dto/question-filter.input.ts`
- `backend/src/modules/question-bank/dto/upsert-question.input.ts`

## Requirements

1. Query: `questionBank(filters)` и `question(id)`.
2. Mutation: `createQuestion`, `updateQuestion`, `archiveQuestion`.
3. Доступ только для авторизованных пользователей компании.
4. Ответ включает checkpoints и examples.
5. Pagination: limit/offset (минимум в list query).

## Step-by-step Plan

1. Создать GraphQL object/input типы.
2. Реализовать resolver методы и подключить guard.
3. Добавить company scoping по `currentUser.companyId`.
4. Проверить schema и ручные запросы.

## Acceptance Criteria

- GraphQL API позволяет читать и менять вопросы.
- Операции изолированы в рамках company.
- Типы схемы готовы для frontend RTK Query.

## Checks

```bash
cd backend && npm run build
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -H 'Authorization: Bearer $JWT' -d '{"query":"{ questionBank(filters:{limit:10,offset:0}) { items { id title } total } }"}'
```

## Completion Notes

- Добавлен `QuestionBankModule` с queries `questionBank`, `question` и mutations `createQuestion`, `updateQuestion`, `archiveQuestion`.
- Все операции защищены `GqlAuthGuard`, scoped по `currentUser.companyId`.
- Проверка: `curl` POST `/graphql` с JWT → `questionBank.total = 6`.
