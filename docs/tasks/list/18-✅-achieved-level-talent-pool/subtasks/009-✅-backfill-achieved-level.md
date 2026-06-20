# TASK-18.9 — Backfill achieved_level на старых завершённых попытках

Status: [x] done

## Depends on

- TASK-18.2 (util), TASK-18.3 (колонки), TASK-18.4 (persist).

## Проблема

`achieved_level` считается только начиная с миграции 023 (TASK-18.4). На всех ранее завершённых
попытках `final_evaluations.achieved_level = NULL` → они не попадают в talent pool. Пул будет почти
пустым, пока не накопятся новые интервью.

## Решение

Детерминированный backfill БЕЗ вызова LLM: `computeAchievedLevel` — чистая функция от per-question
score-данных, которые уже сохранены. Для каждой `final_evaluations` с `achieved_level IS NULL`
собрать те же `scoreInputs` (level/score/maxScore по вопросам попытки — из
`interview_question_summaries`, при отсутствии — из `question_evaluations`, как делает
`FinalEvaluationService`), посчитать achievedLevel/method и `UPDATE` строку.

## Scope

- Реализовать backfill как идемпотентный скрипт/команду (в стиле проекта — посмотри, есть ли уже
  одноразовые scripts/seed/runner; если нет — Nest standalone-скрипт или SQL-aware ts-node, по
  конвенции). Обновляет ТОЛЬКО строки с `achieved_level IS NULL` (повторный запуск — no-op).
- Переиспользовать существующую логику сбора `scoreInputs` из `FinalEvaluationService` (вынести в
  общий метод/util при необходимости, без дублирования). НЕ трогать сам скоринг/рекомендацию.
- Логировать: сколько строк обновлено, сколько пропущено (нет per-question данных).

## Verification

- Запустить на живой БД: до — `SELECT COUNT(*) FROM final_evaluations WHERE achieved_level IS NULL`;
  после — обновлённые строки имеют непустой achieved_level (где есть данные). Повторный запуск → 0
  обновлений (идемпотентность). Показать вывод.
- build + eslint + затронутые jest зелёные.
- Сверить хотя бы одну backfill-строку с ручным ожиданием (уровни вопросов → ожидаемый achievedLevel).

## Completion Notes

### Что сделано

- Вынес сбор `scoreInputs` в чистый util `backend/src/modules/ai-evaluation/utils/build-score-inputs.util.ts`
  (`buildScoreInputs`) — единый источник маппинга для live-оценки и backfill, БЕЗ дублирования.
  `FinalEvaluationService.evaluateAndPersistFinalEvaluation` теперь использует его (поведение
  live-оценки не изменилось — тот же результат).
- Добавил `FinalEvaluationService.collectScoreInputs(companyId, attemptId, interviewId)`: тот же
  способ сбора, что в live (summaries при `adaptiveSummaries.length >= interviewQuestions.length`,
  иначе `question_evaluations`), но БЕЗ LLM и БЕЗ throw — возвращает `null`, если нет per-question
  данных (попытка пропускается).
- `FinalEvaluationRepository`:
  - `findAchievedLevelBackfillCandidates()` — строки с `achieved_level IS NULL AND
    achieved_level_method IS NULL` + `interview_id` (JOIN interview_attempts);
  - `backfillAchievedLevel({finalEvaluationId, achievedLevel, achievedLevelMethod})` — идемпотентный
    `UPDATE ... WHERE id=? AND achieved_level IS NULL AND achieved_level_method IS NULL` (не
    перетирает live-строки, повторный запуск = 0).
- Standalone NestJS-скрипт `backend/src/scripts/backfill-achieved-level.ts`
  (`NestFactory.createApplicationContext` на минимальном модуле без HTTP/GraphQL + `process.exit`):
  для каждой строки собирает `scoreInputs`, зовёт `computeAchievedLevel`, делает UPDATE; логирует
  всего кандидатов / обновлено (с уровнем) / обновлено (estimate-null) / пропущено (нет данных) /
  no-op. npm-скрипт `backfill:achieved-level`.
- Unit-тест `build-score-inputs.util.spec.ts` (3 кейса: adaptive summaries, fallback на
  question_evaluations, дефолты level/difficulty при отсутствии meta).

### Команды / ожидание / результат (живая БД ai_interviewer @ :3322)

- `pnpm -C backend build` → exit 0.
- eslint на 5 изменённых файлах → 0 ошибок (остальные prettier-ошибки в модуле — pre-existing,
  не трогал).
- `npx jest src/modules/ai-evaluation src/modules/scoring` → 14 suites / 47 passed.
- **ДО:** `SELECT COUNT(*) FROM final_evaluations WHERE achieved_level IS NULL` → **3**.
- `pnpm -C backend backfill:achieved-level` → лог:
  - Candidates: 3; Updated (with level): 3; estimate/null: 0; skipped: 0; no-op: 0.
  - fe#66 (attempt 103) → senior/evidence; fe#67 (attempt 104) → senior/evidence;
    fe#68 (attempt 105) → middle/evidence.
- **ПОСЛЕ:** `COUNT(... IS NULL)` → **0** (уменьшилось на 3 обновлённых). Строки:
  65 junior, 66 senior, 67 senior, 68 middle (все evidence).
- **Идемпотентность:** второй запуск → Candidates: 0, Updated: 0 (no-op).
- **Ручная сверка:**
  - attempt 103 — interview 26, один senior-вопрос, summary 9.70/10.00 = 0.97 ≥ 0.65 → passed →
    senior/evidence. Совпало.
  - attempt 105 — interview 32, 10 middle-вопросов, Σ 77.48/91.5 = 0.847 ≥ 0.65 → passed →
    middle/evidence. Совпало.

Скоринг / hireRecommendation / промпт финалки НЕ тронуты — achieved_level отдельная ось.
