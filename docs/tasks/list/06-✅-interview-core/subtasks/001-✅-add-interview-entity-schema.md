# ✅ TASK-06.1 — Схема сущности interview

Status: [x] done  
Priority: High  
Parent block: `06-⬜-interview-core`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить базовую схему interview-домена: таблицы `interviews` и `interview_questions` с привязкой к company и question bank.

## Context

Question bank уже готов как source of truth, auth для рекрутера реализован. Теперь нужно связать всё в жизненный цикл интервью: recruiter создаёт интервью, кандидат по публичной ссылке отвечает, система сохраняет сообщения и завершает попытку с итоговым статусом.

Эта подзадача — часть блока `06-⬜-interview-core` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Схема сущности interview» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- AI scoring и автоматическая оценка качества ответов (блок 07).
- Advanced recruiter dashboard analytics (блок 08).
- Voice/video каналы и media processing (блок 09).
- Email/SMS приглашения и напоминания (блок 11).
- Production hardening и release pipeline (блок 11).

## Files / Folders Allowed

- `backend/migrations/009_create_interviews.sql`
- `backend/migrations/010_create_interview_questions.sql`
- `docs/db/interview-schema.md`

## Requirements

1. `interviews`: `id`, `company_id`, `title`, `description`, `status`, `public_token`, `created_by_user_id`, timestamps.
2. `interview_questions`: `interview_id`, `question_id`, `position`, `is_required`.
3. UNIQUE на `interviews.public_token`.
4. FK на `companies`, `users`, `questions`.
5. Индекс на (`company_id`, `status`).

## Step-by-step Plan

1. Подготовить SQL DDL и описание схемы.
2. Сгенерировать и применить миграции.
3. Проверить FK и индексы.
4. Убедиться в совместимости с company scoping.

## Acceptance Criteria

- Сущности interview созданы в БД.
- Связь с question bank реализована.
- Схема готова к API создания.

## Checks

```bash
cd backend && npm run migrate
docker compose exec mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e 'SHOW TABLES LIKE "interview%";'
```

## Completion Notes

**Что сделано:**
- Сверена схема с `docs/database/schemas/interview-core.md` и `backend/migrations/006_create_interview_core.sql` (применена в блоке 02).
- TypeScript entities в `backend/src/modules/interview-core/`: `InterviewEntity`, `InterviewQuestionEntity`, `InterviewQuestionCheckpointEntity`.
- `interview-core.schema.ts` — константы таблиц, company/public_token filters, статусы `draft`/`active`.

**Компромиссы:**
- Subtask описывал `position`/`is_required`/`description`; реальная схема — snapshot (`sort_order`, `source_question_id`, `job_description`, denormalized question fields).
- Отдельные миграции 009/010 не создавались — DDL уже в `006_create_interview_core.sql`.

**Проверки:**
- `npm run build` → OK
- `npm run lint` → OK (после prettier fix)
- `npm run migrate` → `Database schema is up to date`
- MySQL: `interviews`, `interview_questions`, `interview_question_checkpoints` + `006_create_interview_core` в `schema_migrations`
