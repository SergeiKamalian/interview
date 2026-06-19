# TASK-15.4 — Добавить frontend GraphQL/RTK Query слой

Status: [x] done

## Goal

Подключить frontend data layer для interview templates.

## Scope

- Добавить GraphQL operations.
- Сгенерировать GraphQL types.
- Добавить RTK Query endpoints в FSD-like слой.
- Не менять create modal в этом subtask.

## Verification

- Frontend build.
- Проверить, что hooks возвращают templates list и create-from-template mutation.

## Completion Notes

### Что изменено

- Добавлены GraphQL operations:
  - `frontend/src/shared/api/graphql/operations/company-interview-templates.graphql`;
  - `frontend/src/shared/api/graphql/operations/create-interview-template.graphql`;
  - `frontend/src/shared/api/graphql/operations/create-interview-from-template.graphql`.
- Выполнена генерация GraphQL:
  - `frontend/src/shared/api/graphql/generated/graphql.ts`;
  - `frontend/src/shared/api/graphql/generated/gql.ts`;
  - `frontend/src/shared/api/graphql/operations.registry.ts`.
- Добавлен RTK Query слой:
  - `frontend/src/entities/interview-template/api/interviewTemplatesApi.ts`.
- В `baseApi` добавлен cache tag `InterviewTemplate`.

### Какие hooks доступны для следующих subtasks

- `useCompanyInterviewTemplatesQuery`
- `useCreateInterviewTemplateMutation`
- `useCreateInterviewFromTemplateMutation`

### Какие проверки выполнены

- `pnpm -C frontend graphql:sync`
  - expected: generated types and registry include template operations;
  - actual: success, registry has 36 operations.
- `pnpm -C frontend build`
  - expected: TypeScript and Vite build pass;
  - actual: success.
- `pnpm -C frontend exec eslint "src/entities/interview-template/**/*.ts" "src/shared/api/baseApi.ts"`
  - expected: changed frontend API files pass lint;
  - actual: success.
- `ReadLints` for changed frontend API files
  - expected: no diagnostics;
  - actual: no linter errors.
- `rg "useCompanyInterviewTemplatesQuery|useCreateInterviewTemplateMutation|useCreateInterviewFromTemplateMutation|CompanyInterviewTemplates" frontend/src`
  - expected: hooks and generated operation types are present;
  - actual: all entries found.
