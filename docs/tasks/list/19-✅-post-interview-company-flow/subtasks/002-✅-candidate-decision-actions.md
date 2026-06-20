# TASK-19.2 — Candidate decision actions

Status: [x] done

## Goal

Перестроить company-side страницу конкретного интервью в decision workspace: не показывать отчёт случайного первого кандидата по умолчанию, а дать hiring team обзор интервью, top candidates, сравнение 2–3 кандидатов и явный выбор кандидата для детального review.

## Scope

- Страница `/dashboard/interviews/:interviewId`.
- Кнопка `Детали интервью` открывает modal с метаданными интервью.
- По умолчанию не выбирать первый attempt и не показывать его transcript/checkpoints.
- Показать top 3 candidates по score.
- Добавить compare selection для 2–3 кандидатов.
- Детальный candidate review показывать только после явного выбора.
- Исправить заметные hardcoded light colors на странице интервью и score widgets на theme tokens.
- Не добавлять новую DB table для persistent decision state в этом subtask.

## Verification

- Frontend build.
- Targeted eslint.
- UI smoke-check `/dashboard/interviews/31`: overview без автопоказа первого кандидата, modal details, top candidates, compare, explicit review.

## Completion Notes

Реализован frontend decision workspace на странице конкретного интервью:

- `/dashboard/interviews/:interviewId` больше не выбирает первый attempt автоматически.
- Transcript/checkpoints/score cards грузятся и показываются только после явного клика `Review`.
- Добавлена кнопка `Детали интервью`, которая открывает `Dialog` с метаданными интервью и public link.
- Добавлен overview блок: total attempts, completed, evaluated.
- Добавлен `Decision workflow` с шагами shortlist/compare/review.
- Добавлен `Top candidates` по score.
- Добавлено сравнение 2–3 кандидатов через локальный compare selection.
- Добавлена общая таблица кандидатов с actions: `Review`, `Compare`, `Report`.
- Добавлен selected candidate review блок с возможностью скрыть детали.
- Dark mode: заменены hardcoded `slate-*`/light-only классы на theme tokens в:
  - `InterviewDetailsPage`;
  - `OverallScoreCard`;
  - `RecommendationCard`;
  - `CategoryBreakdownChart`;
  - `DemonstratedLevelCard`.

Verification:

- `pnpm -C frontend exec eslint src/pages/dashboard/interviews/InterviewDetailsPage.tsx src/widgets/score/OverallScoreCard.tsx src/widgets/score/RecommendationCard.tsx src/widgets/score/CategoryBreakdownChart.tsx src/widgets/score/DemonstratedLevelCard.tsx` — ожидал 0 ошибок; получил exit 0.
- `pnpm -C frontend build` — ожидал успешный `graphql:sync`, `tsc -b`, `vite build`; получил exit 0, только стандартный Vite chunk-size warning.
- `ReadLints` по изменённым frontend files — ошибок нет.
- `rg "slate-|bg-white|text-white|border-slate"` по `InterviewDetailsPage` и `widgets/score` — совпадений нет.
- UI smoke-check через Vite `:4662` + backend `:3000`, company1 token:
  - `/dashboard/interviews/31` открылся без `attemptId` и без автопоказа transcript/checkpoints;
  - кнопка `Детали интервью` открыла modal с public link и метаданными;
  - top candidates показал Sergey Frontend, score 5.5, recommendation `Maybe`;
  - `Compare` добавил кандидата в compare block;
  - `Review` выставил URL `?attemptId=102`;
  - после `Review` DOM содержит `Selected candidate review`, `Overall score`, `Transcript`.
