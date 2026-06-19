# TASK-15.5 — Добавить create interview modal

Status: [x] done

## Goal

Заменить прямой переход `Создать интервью` на modal выбора сценария.

## Scope

- Modal: `Из шаблона` / `С нуля`.
- Template list with basic search/filter.
- `С нуля` ведёт в текущий manual create flow.
- `Из шаблона` вызывает `createInterviewFromTemplate`.

## Verification

- Frontend build.
- Route smoke-check:
  - открыть `/dashboard/interviews`;
  - нажать `Создать интервью`;
  - создать interview из template;
  - открыть manual create flow через `С нуля`.

## Completion Notes

### Что изменено

- Добавлен widget `CreateInterviewStartButton`.
- Кнопки `Создать интервью` на `/dashboard/interviews` теперь открывают modal выбора сценария.
- Кнопки создания в dashboard overview table также открывают тот же modal.
- Modal содержит:
  - поиск по template;
  - фильтр по level;
  - список templates;
  - action `Из шаблона`;
  - action `Создать с нуля`.
- `Из шаблона` вызывает `createInterviewFromTemplate` и после создания draft ведёт на `/dashboard/interviews/:id`.
- `Создать с нуля` ведёт на существующий manual flow `/dashboard/interviews/create`.

### Какие проверки выполнены

- `pnpm -C frontend build`
  - expected: TypeScript and Vite build pass;
  - actual: success.
- `pnpm -C frontend exec eslint "src/widgets/dashboard/CreateInterviewStartButton.tsx" "src/pages/dashboard/interviews/InterviewsPage.tsx" "src/widgets/dashboard/DashboardInterviewsTable.tsx"`
  - expected: changed modal files pass lint;
  - actual: success.
- Browser route smoke-check на `http://localhost:5175/dashboard/interviews`:
  - expected: `Создать интервью` opens modal;
  - actual: modal opened with search, level filter and `Создать с нуля`.
- Browser GraphQL smoke setup:
  - created temporary template in current company via `/graphql`;
  - expected: template appears in modal;
  - actual: `Из шаблона` button appeared for created template.
- Browser create-from-template smoke:
  - clicked `Из шаблона`;
  - expected: draft interview is created and route changes to details page;
  - actual: route changed to `/dashboard/interviews/16`.
- Browser manual flow smoke:
  - opened modal again and clicked `Создать с нуля`;
  - expected: route changes to manual create page;
  - actual: route changed to `/dashboard/interviews/create`.

### Notes

- `ReadLints` showed an IDE diagnostic for existing alias import `@widgets/dashboard/InterviewSummariesTable` in `InterviewsPage`, but `frontend build` resolves it successfully. Treating it as stale IDE diagnostic.
