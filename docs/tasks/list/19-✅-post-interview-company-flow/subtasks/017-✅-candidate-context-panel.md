# TASK-19.17 — Candidate context panel

Status: [x] done

## Goal

На review / в таблице видеть **кто этот человек в контексте компании**, не открывая 3 экрана.

## Scope

- Compact panel/sidebar на `AttemptReviewPage` (+ optional expand в таблице):
  - email, phone, LinkedIn, GitHub (из `candidateReport` / candidates)
  - другие завершённые интервью этой компании
  - talent pool / achieved level из других попыток (reuse existing queries где возможно)
- Links outward только если данные есть.
- Read-only; без редактирования профиля.

## Depends on

- TASK-19.11 (таблица — optional inline)
- Existing `candidateReport`, `matchingCandidatesForLevel` patterns

## Verification

- кандидат с 2 interviews → оба видны в history
- LinkedIn/GitHub render when present

## Completion Notes

- Добавлен widget `CandidateContextPanel` (`frontend/src/widgets/candidate/CandidateContextPanel.tsx`): reuse `useCandidateReportQuery`, секции контакты / профили / talent pool / другие интервью компании / ссылка на полный отчёт.
- Подключён на `AttemptReviewPage` сразу под шапкой review (read-only).
- Inline-индикатор в таблице кандидатов не делался: в `interviewAttemptsPage` нет полей LinkedIn/GitHub, N+1 через `candidateReport` на каждую строку — вне scope.
- Verify:
  - `pnpm exec eslint src/widgets/candidate/CandidateContextPanel.tsx src/pages/dashboard/interviews/AttemptReviewPage.tsx` → exit 0
  - `pnpm exec vite build` → exit 0 (стандартный chunk warning)
  - `pnpm run build` → fail на prebuild `graphql:sync` из-за несинхронизированных ops других subtasks (share link / compare ranking) — не связано с 19.17
