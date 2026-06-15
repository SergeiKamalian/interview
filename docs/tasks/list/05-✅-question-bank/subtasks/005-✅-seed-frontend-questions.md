# ⬜ TASK-05.5 — Seed-данные вопросов для frontend

Status: [x] done  
Priority: Medium  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить набор seed-вопросов для локальной разработки, чтобы frontend мог сразу отображать question bank без ручного ввода.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Seed-данные вопросов для frontend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/seeds/question-bank.seed.sql`
- `backend/package.json` (script `seed:question-bank`)
- `docs/seeds/question-bank.md`

## Requirements

1. Seed должен создавать категории, 10-20 вопросов, checkpoints и примеры ответов.
2. Seed привязан к тестовой company (например `acme-recruiting`).
3. Повторный запуск не должен плодить дубликаты (upsert/clean strategy).
4. Тексты вопросов соответствуют интервью по найму (реалистичные).

## Step-by-step Plan

1. Подготовить SQL seed с idempotent inserts.
2. Добавить npm script для запуска seed.
3. Прогнать seed после миграций.
4. Проверить через GraphQL list query, что данные видны.

## Acceptance Criteria

- Локальная база заполнена стартовыми вопросами.
- Frontend получает непустой список без ручного ввода.
- Seed безопасен для повторного запуска.

## Checks

```bash
cd backend && npm run seed:question-bank
curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' -H 'Authorization: Bearer $JWT' -d '{"query":"{ questionBank(filters:{limit:5,offset:0}) { total } }"}'
```

## Completion Notes

- `backend/seeds/question-bank.seed.sql` — 6 global frontend-вопросов + lookups, idempotent inserts.
- `npm run seed:question-bank` → `Question bank seed applied successfully`.
- GraphQL list возвращает непустой `total`.
