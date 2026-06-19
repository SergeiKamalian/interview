# TASK-15.3 — Добавить backend GraphQL API templates

Status: [x] done

## Goal

Добавить backend module для company interview templates.

## Scope

- Repository/service/resolver для templates.
- GraphQL query `companyInterviewTemplates`.
- Mutations `createInterviewTemplate` и `createInterviewFromTemplate`.
- `createInterviewFromTemplate` должен делегировать в `InterviewCoreService.createInterview()`.

## Verification

- Backend build.
- GraphQL schema regeneration.
- `curl` GraphQL smoke-check:
  - create template;
  - list templates;
  - create interview from template.

## Completion Notes

### Что изменено

- Добавлен backend module `InterviewTemplatesModule`.
- Добавлены GraphQL types/inputs:
  - `CompanyInterviewTemplatesFilterInput`;
  - `CreateInterviewTemplateInput`;
  - `InterviewTemplateType`;
  - `CompanyInterviewTemplatesPayloadType`.
- Добавлены GraphQL operations:
  - `companyInterviewTemplates`;
  - `createInterviewTemplate`;
  - `createInterviewFromTemplate`.
- Добавлены repository/service/resolver:
  - `InterviewTemplatesRepository`;
  - `InterviewTemplatesService`;
  - `InterviewTemplatesResolver`.
- `createInterviewFromTemplate` делегирует создание snapshot в `InterviewCoreService.createInterview()`.
- `InterviewTemplatesModule` зарегистрирован в `AppModule`.
- `backend/src/schema.gql` обновлён новыми template operations.

### Какие проверки выполнены

- `pnpm -C backend build`
  - expected: backend compiles;
  - actual: success.
- `pnpm -C backend exec eslint "src/modules/interview-templates/**/*.ts" "src/app.module.ts"`
  - expected: changed backend files pass lint;
  - actual: success.
- `pnpm -C backend test -- --runInBand`
  - expected: backend test command completes;
  - actual: success, no tests found.
- `rg "companyInterviewTemplates|createInterviewTemplate|createInterviewFromTemplate|InterviewTemplateStatus" backend/src/schema.gql`
  - expected: schema has new query/mutations/types;
  - actual: all entries found.
- GraphQL smoke-check against temporary backend on `PORT=4002`:
  - registered temporary company/user;
  - queried `questionBank`;
  - created template with 2 questions;
  - listed templates by search;
  - created draft interview from template.
  - actual output:
    - `question_bank_total: 564`;
    - `created_template: 2 2`;
    - `list_total: 1`;
    - `created_interview: 15 draft 2`.

### Notes

- Full `pnpm -C backend lint` was already known to fail on pre-existing unrelated prettier/unsafe errors outside this subtask. Targeted lint for changed files passes.
