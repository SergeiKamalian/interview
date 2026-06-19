# 15-🟡-interview-templates — Шаблоны интервью

## Цель блока

Добавить company-owned interview templates, чтобы компания могла быстро создавать новые интервью из заранее сохранённого набора настроек и вопросов.

Template — это blueprint, а не snapshot. Snapshot вопросов и checkpoints создаётся только в `interviews` через существующий `InterviewCoreService.createInterview()`.

---

## Контекст

После улучшения dashboard и списка интервью стало видно, что текущий flow создания интервью неудобен для повторяющихся вакансий: HR/Tech Lead каждый раз заново заполняет роль, уровень, welcome text и выбирает вопросы.

Нужен отдельный слой:

```txt
question bank → interview template → interview instance → candidate attempts
```

---

## Входит в блок

- Design docs для product flow и database schema.
- SQL migration for `interview_templates` and `interview_template_questions`.
- Backend GraphQL API:
  - list templates;
  - create template;
  - create interview from template;
  - later: save template from existing interview.
- Frontend create modal:
  - `Из шаблона`;
  - `С нуля`.
- RTK Query + GraphQL operations.

---

## Не входит в первый проход

- Template versioning.
- Marketplace/platform presets.
- AI-generated templates.
- Full drag-and-drop template editor.
- Изменение snapshot strategy для существующих `interviews`.

---

## Design Docs

- `docs/interview-templates/README.md`
- `docs/database/schemas/interview-templates.md`

---

## Architecture Rules

- `question bank` остаётся source of truth.
- Template stores `question_id`, not copied checkpoints.
- `createInterviewFromTemplate` delegates to existing `InterviewCoreService.createInterview()`.
- Backend imports без `.js` suffix.
- GraphQL — основной API для templates.
- Frontend data layer — RTK Query + GraphQL.
