# TASK-15.2 — Добавить SQL schema для templates

Status: [x] done

## Goal

Добавить backend SQL migration для `interview_templates` и `interview_template_questions`.

## Scope

- Создать `backend/migrations/019_create_interview_templates.sql`.
- Следовать `docs/database/schemas/interview-templates.md`.
- Не добавлять GraphQL API в этом subtask.

## Verification

- Запустить migration runner.
- Проверить наличие таблиц и indexes в MySQL.
- Проверить FK behavior для template questions.

## Completion Notes

### Что изменено

- Добавлена migration `backend/migrations/019_create_interview_templates.sql`.
- Созданы таблицы:
  - `interview_templates`;
  - `interview_template_questions`.
- Схема следует `docs/database/schemas/interview-templates.md`:
  - company-scoped templates;
  - ordered `source_question_id`;
  - `ON DELETE RESTRICT` для source question;
  - indexes для list/filter и ordered question lookup.

### Какие проверки выполнены

- `pnpm -C backend build`
  - expected: backend собирается;
  - actual: success.
- `pnpm -C backend lint`
  - expected: lint clean;
  - actual: failed on pre-existing prettier/unsafe errors in unrelated `backend/src/**/*.ts`; migration SQL не участвует в этих errors.
- `pnpm -C backend migrate`
  - expected: migration `019_create_interview_templates.sql` применяется;
  - actual: `Applied OK: 019_create_interview_templates.sql`.
- DB smoke-check через `information_schema`:
  - expected: `interview_templates` и `interview_template_questions` существуют;
  - actual: обе таблицы найдены.
- DB indexes/FK smoke-check:
  - expected: indexes and FK constraints registered;
  - actual: FK constraints found:
    - `fk_interview_template_questions_source_question`;
    - `fk_interview_template_questions_template`;
    - `fk_interview_templates_company`;
    - `fk_interview_templates_created_by_user`;
    - `fk_interview_templates_profession`.
- FK behavior smoke-check:
  - expected: insert into `interview_template_questions` with invalid `source_question_id` fails;
  - actual: MySQL returned `ER_NO_REFERENCED_ROW_2`.
