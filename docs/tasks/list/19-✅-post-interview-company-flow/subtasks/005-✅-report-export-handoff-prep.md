# TASK-19.5 — Report export / handoff prep

Status: [x] done

## Goal

Экспорт результатов интервью для передачи дальше (HR, тимлид, ATS вручную): **только выбранные** кандидаты из таблицы, structured package или PDF.

## Scope

- Минимальный export payload: candidate identity, score, recommendation, achieved level, summary, strengths/weaknesses/risks, interview metadata.
- UI: кнопка «Экспорт» активна когда в таблице выбран ≥1 attempt (checkbox selection из TASK-19.11).
- Форматы первого прохода: JSON bundle + printable HTML/PDF (REST download если нужен file).
- **Не делать** ATS webhooks (блок 12).
- GraphQL остаётся основным API; REST только для file download.
- Работает с **пагинацией**: selection может включать кандидатов с разных страниц (persist selected attemptIds в state).

## Depends on

- TASK-19.11 (row selection + pagination в таблице интервью)

## Completion Notes

- Frontend feature `features/attempt-export`: сбор bundle из `selectedAttempts` Map + параллельный fetch `finalEvaluationByAttempt` (tenant-scope на backend) для summary/strengths/weaknesses/risks.
- UI: dropdown «Экспорт» на `InterviewDetailsPage` в блоке «Все кандидаты» — disabled без selection; пункты «Скачать JSON» и «Печать HTML».
- Export payload v1.0: interview metadata + per-candidate attempt/review/company decision + evaluation (или null если оценка не готова).
- Verify:
  - `pnpm exec eslint src/features/attempt-export/**/*.{ts,tsx} src/pages/dashboard/interviews/InterviewDetailsPage.tsx` → exit 0
  - `pnpm exec vite build` → exit 0 (стандартный Vite chunk warning)
  - `pnpm build` → падает на `graphql:sync` из-за GraphQL ops будущих subtasks (attempt notes/share link, ranking) — не связано с 19.5
  - Logic: bundle строится только из `selectedAttempts.values()`; evaluations запрашиваются по attemptId через guarded GraphQL query с `companyId`
