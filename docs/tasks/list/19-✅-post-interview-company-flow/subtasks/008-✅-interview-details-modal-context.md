# TASK-19.8 — Interview details modal context

Status: [x] done

## Goal

Расширить модалку `Детали интервью` на странице `/dashboard/interviews/:id`, чтобы company user видел не только базовые поля, но и стек, профессию, уровень и вопросы интервью.

## Scope

- Добавить в `interviewDetails` GraphQL fields:
  - `professionName`;
  - `level`;
  - `skills`;
  - `questions { id sortOrder questionText level difficulty topicName maxScore }`.
- На frontend расширить modal:
  - блок `Основное`;
  - блок `Стек`;
  - блок `Вопросы интервью`;
  - список вопросов с темой, уровнем, сложностью и max score.
- Сохранить dark-mode friendly theme tokens.
- Не менять candidate flow.
- `TASK-19.5 — Report export / handoff prep` не закрывать.

## Verification

- [x] Backend build.
- [x] Frontend build.
- [x] Targeted eslint.
- [x] GraphQL smoke.
- [x] Browser smoke в dark mode.

## Completion Notes

- Backend:
  - `InterviewDetailsRepository` теперь подтягивает `professionName`, вопросы интервью и distinct skills через `interview_questions.source_question_id -> question_skills -> skills`.
  - `InterviewDetailsType` получил `InterviewDetailsQuestionType`, `professionName`, `level`, `skills`, `questions`.
  - `InterviewDetailsService` маппит новые поля в GraphQL response.
- Frontend:
  - `interview-details-dashboard.graphql` расширен новыми fields.
  - `InterviewDetailsPage` modal `Детали интервью` расширена до `max-w-4xl`, scrollable, с секциями `Основное`, `Стек`, `Вопросы интервью`.
  - Вопросы показывают номер, уровень, сложность, тему и `до X баллов`.

Commands / checks:

- `pnpm -C backend exec eslint src/modules/interviews/repositories/interview-details.repository.ts src/modules/interviews/graphql/interview-details.type.ts src/modules/interviews/services/interview-details.service.ts` → exit 0.
- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx` → exit 0.
- `pnpm -C backend build` → exit 0.
- `pnpm -C frontend build` → exit 0; только стандартный Vite chunk-size warning.
- GraphQL smoke against `:3000`: `interviewDetails(32)` вернул `professionName: Frontend Developer`, `level: middle`, `skills: [CSS, HTML, HTML & CSS, JavaScript, Next.js, React]`, `questions` length 10.
- Browser smoke:
  - `localhost:5174` не был доступен из окружения, поэтому поднят временный Vite `:4662` с `VITE_GRAPHQL_URL=/graphql`; backend `:3000` healthy.
  - Открыта `/dashboard/interviews/32`, dark mode.
  - Modal `Детали интервью` открылась и показала `Основное`, `Стек`, `Вопросы интервью`, профессию, skills и 10 вопросов.
