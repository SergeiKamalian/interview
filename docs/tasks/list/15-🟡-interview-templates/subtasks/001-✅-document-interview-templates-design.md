# TASK-15.1 — Зафиксировать interview templates design

Status: [x] done

## Goal

Описать продуктовый и технический дизайн interview templates перед SQL/API реализацией.

## Context

Текущий flow создания интервью работает, но неудобен для повторяющихся вакансий: компания каждый раз заново выбирает вопросы и заполняет одинаковые настройки. Нужен reusable blueprint между `question bank` и конкретным `interview`.

## Scope

- Добавить product design doc для interview templates.
- Добавить database design doc в `docs/database/schemas/`.
- Завести отдельный task block `15-🟡-interview-templates`.
- Обновить общий task status и task README.
- Не писать runtime code и SQL migration в этом subtask.

## Requirements

- Template хранит `question_id`, а не snapshot checkpoints.
- `question bank` остаётся source of truth до момента создания интервью.
- `interviews` продолжают хранить immutable snapshot.
- `createInterviewFromTemplate` должен использовать существующий `InterviewCoreService.createInterview()`.
- В документации должны быть phase plan и MVP границы.

## Verification

- Проверить, что design docs читаются и содержат links между product/database/task docs.
- Проверить, что task block виден в `docs/tasks/STATUS.md` и `docs/tasks/README.md`.
- Проверить, что следующий subtask может реализовать SQL migration без дополнительных продуктовых решений.

## Completion Notes

### Что добавлено

- `docs/interview-templates/README.md` — product/domain design:
  - `question bank → interview template → interview instance`;
  - MVP UX для modal `Из шаблона / С нуля`;
  - план GraphQL operations;
  - phase plan.
- `docs/database/schemas/interview-templates.md` — database design:
  - `interview_templates`;
  - `interview_template_questions`;
  - indexes, FK policy, DDL preview;
  - snapshot boundary.
- `docs/tasks/list/15-🟡-interview-templates/README.md` — описание блока.
- `docs/tasks/list/15-🟡-interview-templates/TASKS.md` — subtasks 15.1–15.6.
- `docs/tasks/STATUS.md` и `docs/tasks/README.md` — active block переключён на block 15.

### Какие решения зафиксированы

- Template stores ordered `source_question_id`.
- Template не хранит copied checkpoints, weights или ideal answers.
- Existing `InterviewCoreService.createInterview()` остаётся единственной точкой создания interview snapshot.
- `source_question_id` в template questions использует `ON DELETE RESTRICT`.
- First implementation pass: backend SQL/API, затем frontend modal, затем `save as template`.

### Какие проверки выполнены

- Прочитаны обязательные docs:
  - `docs/PROJECT.md`;
  - `docs/DECISIONS.md`;
  - `docs/tasks/STATUS.md`;
  - `docs/tasks/CURSOR_RULES.md`;
  - `docs/tasks/README.md`;
  - `docs/database/CONVENTIONS.md`;
  - `docs/database/schemas/interview-core.md`.
- Выполнена проверка ссылок и наличия новых файлов:
  - `rg "interview_templates|TASK-15.1|Interview Templates" docs`
  - expected: новые product/database/task docs находятся поиском;
  - actual: проверка прошла.
- Runtime code не менялся; build/test для backend/frontend не требуется для documentation-only subtask.
