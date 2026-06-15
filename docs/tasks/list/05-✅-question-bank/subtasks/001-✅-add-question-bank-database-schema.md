# ✅ TASK-05.1 — Схема БД для question bank

Status: [x] done  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы вопросника: `question_categories`, `questions`, `question_checkpoints`, `question_answer_examples` с привязкой к company.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Схема БД для question bank» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `docs/db/question-bank-schema.md`
- `backend/migrations/005_create_question_bank_tables.sql` (или split files)
- `backend/src/modules/question-bank/types/`

## Requirements

1. `questions` включает: `id`, `company_id`, `category_id`, `title`, `prompt`, `difficulty`, `status`, timestamps.
2. `question_checkpoints`: `question_id`, `label`, `weight`, `position`.
3. `question_answer_examples`: `question_id`, `kind` (`good|bad`), `text`.
4. UNIQUE: (`company_id`, `title`) optional, индексы на `company_id`, `status`, `difficulty`.
5. FK с `ON DELETE CASCADE` для дочерних таблиц.

## Step-by-step Plan

1. Согласовать ER-структуру и naming conventions.
2. Описать схему в markdown для команды.
3. Подготовить SQL DDL по таблицам и индексам.
4. Проверить совместимость с MySQL 8.

## Acceptance Criteria

- Схема покрывает нужные поля банка вопросов.
- Связи и ограничения корректны.
- Модель готова к CRUD/API.

## Checks

```bash
cd backend && npm run build
cd backend && npm run migrate
```

## Completion Notes

**Что сделано:**
- Сверена схема с `docs/database/schemas/question-bank.md` и `backend/migrations/005_create_question_bank.sql` (уже применена в блоке 02).
- Добавлены TypeScript entity-типы и enum-ы в `backend/src/modules/question-bank/` для всех таблиц: `professions`, `skills`, `topics`, `questions`, `question_skills`, `question_checkpoints`, `answer_examples`.
- Добавлен `question-bank.schema.ts` с константами таблиц, visibility filter и правилом checkpoint scores.

**Компромиссы:**
- Subtask-файл описывал устаревшие имена (`question_categories`, `title/prompt`); реализация следует design doc блока 02.
- Отдельный `docs/db/question-bank-schema.md` не создавался — canonical doc уже в `docs/database/schemas/question-bank.md`.

**Проверки:**
- `npm run migrate` → `Database schema is up to date (no pending migrations).`
- MySQL: таблицы `professions`, `questions`, `question_checkpoints`, `answer_examples` существуют; `schema_migrations` содержит `005_create_question_bank`.
- `npm run build` → OK
- `npm run lint` → OK
