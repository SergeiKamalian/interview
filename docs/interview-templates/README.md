# Interview Templates

Interview templates — это слой между `question bank` и конкретным `interview`.

Цель: компания один раз собирает blueprint интервью для роли/уровня, а затем быстро создаёт новые публичные интервью для разных вакансий или волн кандидатов.

---

## Product Problem

Сейчас создание интервью требует каждый раз заново:

- заполнить title, job role, level, language;
- выбрать вопросы из `question bank`;
- настроить имя интервьюера и welcome text;
- опубликовать ссылку.

Для HR/Tech Lead это неудобно, если компания регулярно нанимает на похожие роли: `Frontend React Middle`, `Backend NestJS Senior`, `QA Automation Middle`.

---

## Domain Model

```txt
question bank
  ↓ question IDs
interview template
  ↓ createInterviewFromTemplate()
interview instance
  ↓ public link + attempts
candidate results
```

### `question bank`

Source of truth для вопросов, эталонных ответов, checkpoint weights и evaluation hints.

### `interview template`

Blueprint компании:

- title;
- job role;
- level;
- interview language;
- optional job description;
- interviewer name;
- welcome message template;
- ordered list of `question_id`.

Template не хранит snapshot вопросов и checkpoints. Он хранит только выбранные `question_id` и метаданные создания интервью.

### `interview instance`

Конкретное интервью с публичной ссылкой. При создании из template backend вызывает тот же core-flow, что и ручное создание: `InterviewCoreService.createInterview()`.

В этот момент создаются immutable snapshots:

- `interview_questions`;
- `interview_question_checkpoints`;
- answer examples / evaluation hints, если они поддерживаются текущим snapshot flow.

---

## Key Decision

Template хранит ссылки на `questions`, а не копии checkpoint snapshot.

Причина:

- `question bank` остаётся source of truth до момента создания интервью;
- исправления в question bank автоматически попадают в будущие интервью из template;
- уже созданные `interviews` не меняются, потому что они имеют собственный snapshot;
- не появляется второй источник правды для weights и checkpoints.

Последствие:

- если вопрос удалён/архивирован, template должен показать warning и не позволять создать интервью без решения пользователя;
- при `createInterviewFromTemplate` backend валидирует доступность всех `question_id` для текущей company;
- повторное создание интервью из одного template может дать новый snapshot, если question bank изменился.

---

## MVP UX

### Entry Points

- На странице `/dashboard/interviews` кнопка `Создать интервью` открывает modal.
- В modal два сценария:
  - `Из шаблона` — выбрать существующий template и быстро создать интервью;
  - `С нуля` — открыть текущий flow ручного создания.
- На странице создания интервью можно сохранить текущий набор вопросов как template.

### Modal: Create Interview

MVP modal должен показывать:

- список templates компании;
- search/filter по title/job role/level;
- summary template: role, level, language, question count;
- actions:
  - `Создать из шаблона`;
  - `Создать с нуля`.

### Save As Template

Первый MVP может поддержать `createInterviewTemplateFromInterview` после создания draft/active interview:

- backend берёт metadata interview;
- берёт ordered `source_question_id` из `interview_questions`;
- создаёт новый template.

---

## GraphQL Contract

Планируемые операции:

```graphql
query CompanyInterviewTemplates($filters: CompanyInterviewTemplatesFilterInput) {
  companyInterviewTemplates(filters: $filters) {
    items {
      id
      title
      jobRole
      level
      interviewLanguage
      questionCount
      updatedAt
    }
    total
  }
}

mutation CreateInterviewTemplate($input: CreateInterviewTemplateInput!) {
  createInterviewTemplate(input: $input) {
    id
    title
    questionCount
  }
}

mutation CreateInterviewFromTemplate($templateId: ID!) {
  createInterviewFromTemplate(templateId: $templateId) {
    id
    title
    publicUrl
    status
    questionCount
  }
}

mutation CreateInterviewTemplateFromInterview($interviewId: ID!, $title: String) {
  createInterviewTemplateFromInterview(interviewId: $interviewId, title: $title) {
    id
    title
    questionCount
  }
}
```

---

## Implementation Phases

### Phase 1 — Backend MVP

- SQL migration for `interview_templates` and `interview_template_questions`.
- NestJS module/repository/service/resolver.
- Queries for company templates.
- Mutations:
  - `createInterviewTemplate`;
  - `createInterviewFromTemplate`.
- `createInterviewFromTemplate` delegates to `InterviewCoreService.createInterview()`.

### Phase 2 — Frontend Create Flow

- RTK Query + GraphQL operations.
- Modal on `Создать интервью`.
- Template list and create-from-template action.
- `CreateInterviewPage` remains the manual flow for `С нуля`.

### Phase 3 — Save From Interview

- `createInterviewTemplateFromInterview`.
- UI action from interview details/list.

### Phase 4 — Editing And Presets

- Update/archive template.
- Duplicate template.
- Platform/system templates, if product needs shared presets.

---

## Non-Goals For MVP

- Template versioning.
- Full template editor with drag-and-drop.
- Marketplace templates.
- AI-generated templates.
- Persisting checkpoint snapshots in templates.

---

## Related

- `docs/database/schemas/interview-templates.md`
- `docs/database/schemas/interview-core.md`
- `docs/tasks/list/15-🟡-interview-templates/`
