# TASK-18.4 — Backend: считать и сохранять achievedLevel

Status: [x] done

## Depends on

- TASK-18.2, TASK-18.3.

## Goal

В `FinalEvaluationService` вызвать util на тех же `scoreInputs` и записать результат в
`final_evaluations`.

## Scope

- `final-evaluation.service.ts`: после `calculateInterviewScore` вызвать achieved-level util на
  тех же `scoreInputs` (там уже есть `level`).
- Прокинуть `achievedLevel`/`achievedLevelMethod` в `UpsertFinalEvaluationData` + entity + repository.
- Не менять промпт финалки и существующий скоринг.

## Verification

- build + eslint; реальная завершённая попытка → строка `final_evaluations` содержит achieved_level.

## Completion Notes

Реализовано: при финальной оценке попытки achievedLevel считается на ТЕХ ЖЕ `scoreInputs`,
что идут в скоринг (у каждого элемента уже есть `level`), и сохраняется в `final_evaluations`.
Существующий скоринг / `mapHireRecommendation` / промпт финалки НЕ менялись — achieved level
остаётся отдельной осью.

### Изменённые файлы

- `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts` — после
  `calculateInterviewScore(scoreInputs)` вызывается `computeAchievedLevel(scoreInputs)`
  (импорт из `../../scoring/achieved-level.util`); `achievedLevel` (или null) и
  `achievedLevelMethod` (`result.method`) проброшены в `upsertByAttemptId(...)`.
- `backend/src/modules/ai-evaluation/entities/final-evaluation.entity.ts` — в
  `FinalEvaluationEntity` и `UpsertFinalEvaluationData` добавлены `achievedLevel: QuestionLevel | null`
  и `achievedLevelMethod: AchievedLevelMethod | null` (`AchievedLevelMethod = 'evidence' | 'estimate'`,
  `QuestionLevel` импортирован из `../../question-bank/types/question-level.enum`).
- `backend/src/modules/ai-evaluation/repositories/final-evaluation.repository.ts` — `achieved_level` /
  `achieved_level_method` добавлены в INSERT, в `ON DUPLICATE KEY UPDATE`, в SELECT и в `mapRow`
  (snake_case в SQL, camelCase в объекте), в стиле существующего upsert.
- `backend/src/modules/ai-evaluation/services/final-evaluation.service.spec.ts` — новый spec
  (раньше теста на этот сервис не было).

### Верификация (команды / ожидание / результат)

- `pnpm -C backend build` → ожидал успех → **exit 0** (nest build OK).
- `npx eslint` на 4 изменённых файлах (service, entity, repository, spec) → ожидал чисто →
  **exit 0**, 0 ошибок.
- `npx jest src/modules/ai-evaluation src/modules/scoring` (cwd backend) → ожидал зелёные →
  **12 suites / 41 tests passed** (включая 2 новых кейса).

### Доказательство записи

Реальный прогон финальной оценки на завершённой попытке невозможен в этой сессии: сервис
вызывает live LLM (`aiProviderService.evaluateJson`) для нарратива, без него `evaluateAndPersistFinalEvaluation`
не доходит до upsert. По договорённости subtask верифицировано unit-тестом, который мокает все
зависимости (включая `finalEvaluationRepository.upsertByAttemptId`) и подаёт реальные `scoreInputs`
с уровнями вопросов, прогоняя НЕзамоканный `computeAchievedLevel`:

- junior 9/10 + middle 8/10 (оба ≥ 0.65) → payload upsert получает `achievedLevel = 'middle'`,
  `achievedLevelMethod = 'evidence'`.
- единственный senior 2/10 (ниже порога) → `achievedLevel = null`, `achievedLevelMethod = 'estimate'`.

Колонки `achieved_level` / `achieved_level_method` уже есть в живой БД (migration 023, TASK-18.3),
repository пишет/читает их корректно (покрыто build + тип-чеком mapRow).
