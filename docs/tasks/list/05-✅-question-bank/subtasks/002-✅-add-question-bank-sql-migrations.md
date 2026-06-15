# ⬜ TASK-05.2 — SQL-миграции question bank

Status: [x] done  
Priority: High  
Parent block: `05-⬜-question-bank`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать и применить raw SQL миграции для question bank таблиц и индексов с идемпотентным поведением.

## Context

Question bank используется рекрутером для подготовки интервью и кандидатом в flow блока 05. Данные должны быть строго структурированы: категория, сложность, чекпоинты, веса и примеры good/bad ответов, чтобы затем AI evaluation мог опираться на единый источник.

Эта подзадача — часть блока `05-⬜-question-bank` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «SQL-миграции question bank» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный WYSIWYG редактор вопросов.
- Версионирование вопросов и audit trail.
- Импорт из внешних ATS/LMS систем.
- AI auto-generation вопросов.
- Финальный production UI question manager (блок 08+).

## Files / Folders Allowed

- `backend/migrations/005_create_question_categories.sql`
- `backend/migrations/006_create_questions.sql`
- `backend/migrations/007_create_question_checkpoints.sql`
- `backend/migrations/008_create_question_answer_examples.sql`

## Requirements

1. Версии миграций строго возрастают.
2. Таблицы используют `utf8mb4` и `InnoDB`.
3. FK и индексы создаются в тех же миграциях.
4. Повторный `npm run migrate` не применяет уже применённые версии.
5. Ошибки SQL прерывают процесс с кодом 1.

## Step-by-step Plan

1. Создать отдельные SQL файлы по сущностям.
2. Проверить синтаксис в локальном MySQL.
3. Применить миграции через runner.
4. Проверить записи в `schema_migrations`.

## Acceptance Criteria

- Все таблицы question bank созданы.
- Миграции отслеживаются в `schema_migrations`.
- Повторный запуск идемпотентен.

## Checks

```bash
cd backend && npm run migrate
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SHOW TABLES LIKE "question_%";'
```

## Completion Notes

- Подтверждена миграция `backend/migrations/005_create_question_bank.sql` (из блока 02), запись в `schema_migrations`.
- `npm run migrate` → `Database schema is up to date`.
- MySQL: таблицы `professions`, `skills`, `topics`, `questions`, `question_checkpoints`, `answer_examples` существуют.
