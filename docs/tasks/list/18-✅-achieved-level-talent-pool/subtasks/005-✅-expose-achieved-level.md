# TASK-18.5 — API + отчёт: achievedLevel в GraphQL/UI

Status: [x] done

## Depends on

- TASK-18.4.

## Goal

Показать HR демонстрированный уровень и разбивку по уровням в отчёте.

## Scope

- GraphQL: добавить `achievedLevel`, `achievedLevelMethod`, `targetLevel` (с интервью) и
  `levelBreakdown[]` в `FinalEvaluationType` / report-резолверы; regen `schema.gql`.
- Frontend: в отчёте кандидата блок `Target: lead · Demonstrated: middle` + бар по уровням;
  для `method=estimate` — пометка «оценка приблизительная» + подсказка про калибровочные вопросы.

## Verification

- codegen; GraphQL query возвращает поля; страница отчёта рендерит блок.

## Completion Notes

### Решение (наименее инвазивный путь)

- `FinalEvaluationType` (shared между candidate report и interview details) расширен
  полями: `achievedLevel` (nullable `QuestionLevel` — переиспользован `QuestionLevelEnum`
  из question-bank), `achievedLevelMethod` (новый `AchievedLevelMethodEnum {evidence,
  estimate}` через `registerEnumType`), `achievedLevelNote` (nullable String — note из
  util для пометки «оценка приблизительная»), `targetLevel` (nullable `QuestionLevel`),
  `levelBreakdown: [LevelBreakdownType!]!` (`{level, earned, maxScore, ratio, passed}`).
- `levelBreakdown` + `note` НЕ пересчитываются в сервисе отчёта — `FinalEvaluationService`
  теперь кладёт весь `computeAchievedLevel(scoreInputs)` результат в
  `raw_response.achievedLevelResult` (perLevel + note), а `mapFinalEvaluationToGraphql`
  читает его оттуда. Это самый дешёвый путь: считается ровно один раз при сохранении на
  тех же scoreInputs, без второго прохода. Колонки `achieved_level`/`achieved_level_method`
  остаются source of truth для фильтрации (talent pool TASK-18.6).
- `targetLevel` прокинут из `interviews.level`: добавлен `i.level` в history-query
  candidate-report.repository (→ `latestTargetLevel`) и `level` в interview-details.repository;
  оба сервиса передают его третьим аргументом в `mapFinalEvaluationToGraphql`.
- Старые строки (без `achievedLevelResult` в raw_response) деградируют корректно:
  `levelBreakdown=[]`, `note=null`, но `achievedLevel`/`achievedLevelMethod` из колонок и
  `targetLevel` из interview всё равно отдаются.
- Frontend: новый виджет `frontend/src/widgets/score/DemonstratedLevelCard.tsx` (shadcn
  Card + Badge + Tailwind-бары как в `CategoryBreakdownChart`): строка
  «Target: <level> · Demonstrated: <achievedLevel | —>», бар per-level (earned/maxScore,
  отметка passed/not passed), при `method=estimate` — бейдж «оценка приблизительная» +
  note-подсказка. Подключён в `CandidateReportPage`.

### Изменённые файлы

Backend:
- `backend/src/modules/ai-evaluation/graphql/final-evaluation.type.ts` (enum + LevelBreakdownType + 5 полей)
- `backend/src/modules/ai-evaluation/ai-evaluation.mapper.ts` (3-й арг targetLevel + extract из raw_response)
- `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts` (achievedLevelResult в raw_response)
- `backend/src/modules/candidates/repositories/candidate-report.repository.ts` (i.level → latestTargetLevel)
- `backend/src/modules/candidates/services/candidate-report.service.ts` (передаёт deterministicScore + targetLevel)
- `backend/src/modules/interviews/repositories/interview-details.repository.ts` (level в SELECT/InterviewRow)
- `backend/src/modules/interviews/services/interview-details.service.ts` (передаёт interview.level)
- `backend/src/schema.gql` (regen — boot app в dev, autoSchemaFile)
- tests: `ai-evaluation.mapper.spec.ts` (новый, 3 кейса), `final-evaluation.service.spec.ts` (assert perLevel в raw_response)

Frontend:
- `frontend/src/widgets/score/DemonstratedLevelCard.tsx` (новый виджет)
- `frontend/src/pages/dashboard/candidates/CandidateReportPage.tsx` (подключение)
- `frontend/src/shared/api/graphql/operations/candidate-report.graphql` (новые поля)
- `frontend/src/shared/api/graphql/generated/*` + `operations.registry.ts` (codegen)

### Verification

- `pnpm -C backend build` → exit 0.
- schema.gql содержит `achievedLevel`, `achievedLevelMethod`, `achievedLevelNote`,
  `targetLevel`, `levelBreakdown` на `FinalEvaluationType` + `enum AchievedLevelMethod` +
  `type LevelBreakdownType`.
- backend eslint на 8 изменённых файлах → 0 ошибок.
- jest `ai-evaluation` + `scoring` → 12 suites / 41 passed; новый mapper-spec → 3 passed.
- frontend `pnpm graphql:sync` → codegen OK (47 operations), типы обновились (achievedLevel/
  levelBreakdown/targetLevel в `CandidateReportQuery`).
- `pnpm -C frontend build` (tsc -b + vite) → exit 0; eslint на 2 изменённых .tsx → чисто.
- **Real GraphQL e2e** (boot нового dist на :4577, JWT подписан JWT_SECRET, company 1):
  - `evaluateInterviewAttempt(102)` (live LLM) → `achievedLevel=junior`, `method=evidence`,
    `levelBreakdown=[junior 7.16/10 ratio0.72 passed, middle 4.76/10 ratio0.48 not-passed]`.
  - `candidateReport(100)` → `targetLevel=middle`, `achievedLevel=junior`, тот же
    levelBreakdown. Точно сценарий README: целевой middle, демонстрированный — ниже.
  - Замечание: `targetLevel` приходит только через report-резолверы (candidate report /
    interview details); путь `evaluateInterviewAttempt`/`finalEvaluationByAttempt` отдаёт
    `targetLevel=null` (вне scope этого subtask — там нет interview.level в маппере).
