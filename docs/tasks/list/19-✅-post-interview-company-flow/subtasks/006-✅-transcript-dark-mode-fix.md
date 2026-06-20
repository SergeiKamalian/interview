# TASK-19.6 — Transcript dark mode fix + Russian review copy

Status: [x] done

## Goal

Исправить цветовую гамму transcript во вкладке `Расшифровка` на candidate review page, чтобы в dark mode не было белых карточек и light-only текста, а UI-лейблы были на русском.

## Scope

- Обновить `TranscriptPanel`.
- Перевести visible labels на candidate review page: tabs, recommendation labels, score/status labels, evidence/checkpoint labels.
- Использовать theme tokens вместо `bg-white`, `bg-slate-*`, `text-slate-*`, `border-slate-*`.
- Сохранить визуальное отличие ИИ и candidate сообщений через subtle accents.
- Проверить `/dashboard/interviews/32/attempts/105/review` во вкладке `Расшифровка` в dark mode.
- Без backend/API изменений.

## Verification

- [x] Targeted eslint.
- [x] Frontend build.
- [x] Browser smoke в dark mode.

## Completion Notes

- `TranscriptPanel` переведён на dark-mode friendly tokens:
  - ИИ messages: `border-border bg-muted/35`;
  - candidate messages: `border-brand-primary/20 bg-brand-primary/5`;
  - metadata/question text: `text-muted-foreground`;
  - message body: `text-foreground`;
  - search highlight: светлая и тёмная версии через `yellow` opacity, без белого текста/фона.
- Добавлен `cn` для аккуратной сборки классов.
- Убраны старые `bg-white`, `bg-slate-50`, `border-slate-*`, `text-slate-*`.
- Русифицированы visible UI labels в `AttemptReviewPage`, `DashboardLayout`, `TranscriptPanel`, `CheckpointResultsPanel`, `AdaptiveCheckpointReviewPanel`: `Review кандидата` → `Проверка кандидата`, `Candidate report` → `Отчёт кандидата`, `Transcript` → `Расшифровка`, `Evidence` → `Доказательства`, `Overall score` → `Итоговая оценка`, статусы/бейджи checkpoint тоже на русском.
- `TranscriptPanel` локализует отображение transcript-текста без изменения данных в БД: `AI` → `ИИ`, `Q:` → `Вопрос:`, роли `ai`/`assistant` → `ИИ-интервьюер`, `user`/`candidate` → `Кандидат`.

Commands / checks:

- `pnpm -C frontend exec eslint src/widgets/layouts/DashboardLayout.tsx src/pages/dashboard/interviews/AttemptReviewPage.tsx src/widgets/transcript/TranscriptPanel.tsx src/widgets/checkpoints/CheckpointResultsPanel.tsx src/widgets/checkpoints/AdaptiveCheckpointReviewPanel.tsx` → exit 0.
- `pnpm -C frontend build` → exit 0; только стандартный Vite chunk-size warning.
- `rg "slate-|bg-white|text-white|border-slate|bg-yellow-200|text-slate" frontend/src/widgets/transcript/TranscriptPanel.tsx` → no matches.
- `rg "Strong invite|Hiring decision brief|Overall score|Candidate report|Transcript|Evidence|Review кандидата|Review queue" frontend/src ...` → no matches в изменённых UI-компонентах.
- Browser smoke:
  - `localhost:5174` не был доступен из окружения, поэтому поднят временный Vite `:4662` с `VITE_GRAPHQL_URL=/graphql`; backend `:3000` healthy.
  - Открыта `/dashboard/interviews/32/attempts/105/review`, включён dark mode (`Светлая тема` в toggle).
  - Header: `Проверка кандидата`, tabs: `Решение / Доказательства / Расшифровка`, review labels на русском.
  - Вкладка `Расшифровка` открылась; placeholder `Поиск по расшифровке…`, вопросы `Вопрос: ...`, transcript-текст показывает `ИИ-интервьюер`, без `AI-интервьюер`.
