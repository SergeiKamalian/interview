# TASK-19.11 — Interview candidates table upgrade

Status: [x] done

## Goal

Сделать таблицу «Все кандидаты» рабочим списком при большом числе попыток: server-side pagination, колонки review/level/manual review/shortlist, фильтры, checkbox selection, без Report.

## Scope

- GraphQL `interviewAttemptsPage(interviewId, filters)` с pagination/sort/filter (search, hireRecommendation, unreviewedOnly).
- Расширен `InterviewAttemptSummaryType`: achievedLevel, needsManualReview, shortlistStatus + review fields.
- Frontend таблица на paginated query; checkbox selection (persist across pages); фильтр «Только непросмотренные».
- Убран action «Отчёт» из таблицы.
- Default sort: score desc.

## Verification

- `pnpm -C backend build` → exit 0
- `pnpm -C frontend graphql:sync` → 51 ops
- `pnpm -C frontend exec eslint` на изменённых files → exit 0
- `pnpm -C frontend build` → exit 0
- GraphQL smoke: `interviewAttemptsPage(interviewId:"32", unreviewedOnly:true)` → items с reviewStatus/achievedLevel/needsManualReview/shortlistStatus

## Completion Notes

- Overview/top/compare по-прежнему используют `interviewDetails.attempts` (полный список); таблица — отдельный paginated query.
- Selection хранится в `Set<attemptId>` для будущего export (TASK-19.5).
- Следующий subtask: **TASK-19.12** — UI agree/disagree с ИИ.
