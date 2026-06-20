# TASK-19.3 — Separate candidate attempt review page

Status: [x] done

## Goal

Вынести детальный просмотр кандидата из страницы интервью в отдельную страницу candidate attempt review, чтобы `/dashboard/interviews/:id` оставалась overview/compare workspace, а transcript/checkpoints/score открывались отдельно по конкретному кандидату.

## Scope

- Новый route `/dashboard/interviews/:interviewId/attempts/:attemptId/review`.
- Новая frontend page для review конкретного attempt.
- `Review`/`Details` actions на interview page и review queue ведут на новую страницу.
- Страница interview overview больше не использует `?attemptId` и не рендерит candidate detail inline.
- Compare selection ограничен 2 кандидатами.
- Не добавлять новую DB table.
- Не делать export/ATS handoff в этом subtask.

## Verification

- [x] Frontend build.
- [x] Targeted eslint.
- [x] UI smoke-check:
  - `/dashboard/interviews/31` остаётся overview без inline transcript/checkpoints;
  - `Review` открывает `/dashboard/interviews/31/attempts/102/review`;
  - новая страница показывает score/recommendation/transcript/checkpoints;
  - compare показывает лимит `0/2`, после добавления кандидата — `1/2`.

## Completion Notes

- Добавлен route `/dashboard/interviews/:interviewId/attempts/:attemptId/review`.
- Добавлена страница `AttemptReviewPage`: candidate info, score cards, recommendation, category breakdown, adaptive checkpoint review, transcript, checkpoint results, кнопка запуска AI-оценки для pending evaluation.
- `InterviewDetailsPage` больше не рендерит candidate transcript/checkpoints inline и не использует `?attemptId`; `Review` actions ведут на отдельную страницу.
- Compare limit вынесен в `MAX_COMPARE_CANDIDATES = 2`; UI copy обновлён на `2 кандидатов` и `Compare candidates (x/2)`.
- Старые company-side links с `?attemptId=` обновлены в review queue, attempts page, candidate report history и dashboard attention list.
- Dark-mode cleanup в `ReviewQueuePage`: заменены оставшиеся `slate-*`/light-only классы на theme tokens.

Commands / checks:

- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx src/pages/dashboard/interviews/AttemptReviewPage.tsx src/pages/dashboard/review/ReviewQueuePage.tsx src/pages/dashboard/candidates/CandidateReportPage.tsx src/pages/dashboard/attempts/AttemptsPage.tsx src/widgets/dashboard/DashboardAttentionList.tsx src/app/router/routes.tsx src/widgets/layouts/DashboardLayout.tsx` → exit 0.
- `pnpm -C frontend build` → exit 0; только стандартный Vite chunk-size warning.
- `rg "dashboard/interviews/\\$\\{[^}]+\\}\\?attemptId=|2–3|length >= 3" frontend/src` → no matches для company-side links/copy.
- Browser smoke на временном Vite `:4662` + backend `:3000`:
  - `/dashboard/interviews/31` загрузился как overview; transcript/checkpoints inline отсутствуют; copy `Сравните 2 кандидатов`; compare block `0/2`.
  - `Review` у Sergey Frontend открыл `/dashboard/interviews/31/attempts/102/review`.
  - После hard reload route показал `Review кандидата`, score cards, recommendation, category breakdown, adaptive review, transcript и checkpoint results.
  - Нажатие `Compare` на overview перевело блок в `Compare candidates (1/2)`.
- Read-only DB smoke через `mysql2`: интервью с `>=3` attempts в dev DB нет (`[]`), поэтому третий compare-click без синтетических данных не воспроизводился; лимит до 2 проверен кодом/search/build и видимым UI state `x/2`.
