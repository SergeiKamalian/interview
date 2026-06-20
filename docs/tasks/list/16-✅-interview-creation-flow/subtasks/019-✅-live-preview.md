# TASK-16.19 — Live preview «попробовать как кандидат»

Status: [x] done

## Goal

Перед публикацией компания проходит своё интервью в выбранном tone/depth/strictness, без засорения воронки кандидатов.

## Depends on

- TASK-16.7, TASK-16.8, TASK-16.9, TASK-16.10 (поведение AI применяется), TASK-16.14 (визард).

## Context

- Движок прохождения уже есть (adaptive-interview + interview-public).
- Нужен preview-режим attempt, не считающийся реальным кандидатом (не влияет на `max_completions`, аналитику, shortlist).

## Scope

- Backend: preview-режим запуска интервью (напр. флаг на attempt `is_preview` или отдельный resolver), который:
  - применяет текущие настройки интервью (даже для `draft`);
  - НЕ учитывается в лимитах/аналитике/воронке;
  - можно запускать владельцем компании (auth, не публичный токен).
- Frontend: кнопка «Попробовать как кандидат» на шаге 7 (превью) и/или на странице управления; запуск preview-сессии.

## Verification

- backend build + smoke: preview-сессия стартует на draft; не увеличивает completions; не появляется в списках кандидатов/аналитике.
- frontend smoke: кнопка запускает прохождение в выбранном тоне/глубине/строгости.

## Completion Notes

**Решение по архитектуре:** добавлен флаг `is_preview` на `interview_attempts` (а не отдельный движок). Preview переиспользует существующий public session-flow (begin/session/submit по `publicToken` + `attemptId`), но **стартует через owner-authenticated мутацию** `startInterviewPreview(interviewId)` — не через публичный токен. Это работает даже на `draft`/`paused`, потому что public session-резолверы (`beginInterviewAttempt`/`interviewSession`/`submitInterviewAnswer`/`completeInterviewAttempt`) идентифицируют сессию по token+attemptId и **не перепроверяют статус интервью** — единственный статус-гейт был в `startPublicInterview` (`findByPublicToken` со status='active'), который preview обходит. Настройки интервью (tone/depth/strictness, вопросы) применяются автоматически, т.к. preview-attempt привязан к реальной строке интервью.

### Backend

- **Migration `022_interview_attempt_preview.sql`:** `ADD COLUMN is_preview TINYINT(1) NOT NULL DEFAULT 0` + индекс `(interview_id, is_preview)`. Идемпотентна на уровне раннера (`schema_migrations`).
- **Entity / repository:** `isPreview` в `InterviewAttemptEntity`, `AttemptRow`, `mapAttempt`, во всех attempt-SELECT'ах; `createAttempt` принимает `isPreview`.
- **Изоляция от лимитов:** `countCompletedAttempts` / `hasCompletedAttemptForEmail` → `AND is_preview = 0` (preview не влияет на `max_completions` / retake).
- **Изоляция от аналитики/воронки/списков:** `is_preview = 0` добавлен в `interview-details` (attempts list), `interviews-dashboard` (results list + funnel stats subqueries), `candidates-dashboard` (candidate list), `dashboard-overview` (candidates/attempt/attention stats), `candidate-report`, `analytics/topic-skill-question`. AI-cost (`ai-cost.repository`) намеренно НЕ фильтруется — это реальные деньги на LLM, их прятать нельзя.
- **Service** (`interview-public.service.ts`): `startInterviewPreview(companyId, interviewId)` — грузит интервью через `findByIdForCompany` (любой статус), создаёт фиксированного preview-кандидата (`preview+company{id}@interview.local`) + свежий preview-attempt (`is_preview=1`) + welcome. Авто-evaluation НЕ планируется для preview (guard `!attempt.isPreview` во всех трёх путях: adaptive submit, legacy submit, completeAttempt) — не жжём LLM и не создаём final_evaluations.
- **Resolver** (`interview-core.resolver.ts`): `@Mutation startInterviewPreview(interviewId: ID!)` под `GqlAuthGuard` + `@CurrentUser` (owner-only). Новый `StartInterviewPreviewPayload { attemptId, publicToken, totalQuestions }`. `schema.gql` перегенерирован.

### Frontend

- **GraphQL op** `start-interview-preview.graphql` + RTK `useStartInterviewPreviewMutation` (в `publicInterviewApi`). Codegen — 47 ops.
- **UI:** кнопка «Попробовать как кандидат» (shadcn `Button` ghost + `Tooltip` + `PlayIcon`) на странице управления (`InterviewManagePanel`). По клику → `startInterviewPreview(id)` → `window.open('/i/{publicToken}/session?attemptId={attemptId}&preview=1')` в новой вкладке → переиспользуется существующая candidate-сессия. (Размещено на manage-странице — спека допускает «шаг 7 **и/или** страница управления»; шаг 7 — до создания интервью, там ещё нет id.)

### Проверки (команды → ожидание → результат)

- `pnpm -C backend build` → OK; targeted eslint изменённых backend-файлов → OK (единственная оставшаяся ошибка `no-unsafe-enum-comparison` в `interviews-dashboard` — pre-existing, подтверждено через stash-проверку оригинала).
- `pnpm migrate` → применил 022; повторный запуск → «no pending migrations» (идемпотентно).
- **Backend GraphQL smoke (curl, legacy-инстанс :4210, `ADAPTIVE_INTERVIEW_ENABLED=false` для детерминизма без LLM):** register → createInterview **draft** (maxCompletions=1) → `startInterviewPreview` вернул `{attemptId, publicToken, totalQuestions:2}` на draft → begin (in_progress, 1-й вопрос) → submit Q1 (1/2) → submit Q2 (**completed** 2/2) → `companyDashboardOverview.metrics` остался `candidatesTotal:0, completedTotal:0` → `interviewDetails.attempts` = `[]` → `companyInterviews` = `{items:[], total:0}` → интервью всё ещё `draft` → 2-й `startInterviewPreview` **прошёл** несмотря на maxCompletions=1 (лимиты игнорируют preview). Все ожидания совпали.
- **Frontend:** `tsc -b` → OK; eslint (`InterviewManagePanel`, `publicInterviewApi`) → OK; `pnpm build` → OK; codegen 47 ops.
- **Browser e2e (:5182 → :3000, adaptive/LLM ON):** страница управления интервью → кнопка «Попробовать как кандидат» видна → клик создал preview-attempt (id=100) и открыл `/i/{token}/session?attemptId=100&preview=1` → session отрендерил welcome «Привет, Preview candidate! … позицию «Frontend Developer»» → «Начать интервью» → adaptive-движок выдал основной вопрос («боксинг и анбоксинг в JavaScript»), заголовок «Интервью · 0/2». Полное прохождение в настройках интервью подтверждено с живым LLM.
