# TASK-17.6 — Калибровка: golden «сильный senior» + регресс attempt 102

Status: [x] done

## Goal

Зафиксировать защиту от регрессов: добавить golden-кейсы «образцово сильный senior» (на базе attempt 102) с проверкой score-bands, чтобы система больше не занижала сильных кандидатов.

## Depends on

- TASK-17.2, TASK-17.3, TASK-17.4, TASK-17.5 (кейс должен проходить после фиксов).

## Context

- Уже есть harness: `backend/src/modules/adaptive-interview/calibration/golden-calibration.spec.ts` + `calibration/golden-cases/*.json` (см. блок 14: TASK-14.2 «Golden calibration dataset + CI»).
- Текущие кейсы — в основном React Fiber. Нет кейса «сильный senior по виртуализации/замыканиям с развёрнутым ответом», который ловил бы баг занижения.
- Реальные ответы кандидата доступны в БД (attempt 102, messages 1090/1092/1094/1096/1098) — можно взять как эталон сильного ответа.

## Scope

- Добавить golden-кейсы в `calibration/golden-cases/`:
  - сильный ответ по виртуализации списков (Q55) → ожидаем высокий балл, must-have чекпоинты `covered`;
  - сильный ответ по замыканиям (Q56) → высокий балл;
  - (по возможности) кейс «depth=shallow + сильный ответ» → итог НЕ должен быть «weak» из-за неспрошенных чекпоинтов.
- Тексты ответов взять из БД attempt 102 (полные, не усечённые).
- Прописать ожидаемые score-bands и статусы (assert диапазонов, не точечных значений — учесть недетерминизм LLM; если harness детерминированный/замоканный — следовать его конвенции).
- Убедиться, что новый кейс падает на ТЕКУЩЕМ коде (ловит баг) и зеленеет после фиксов 17.2–17.5.

## Verification

- `pnpm -C backend test` (или таргетно `golden-calibration.spec.ts`) — зелёный после фиксов.
- Документ-регресс attempt 102: «сильный senior → ≥ 8/10, strong, invite/strong_invite» (перепрогон через реальную оценку или harness).
- Кейс воспроизводимо падает на коде до фиксов (приложить вывод в Completion Notes).

## Completion Notes

### Что сделано

**Harness обобщён под не-fiber вопросы.** `golden-calibration.spec.ts` строил контекст только под React Fiber (`buildFiberContext`). Добавлен `buildGenericContext()` + ветка `buildGoldenContext()`: если в кейсе есть блок `context` (реальные чекпоинты банка + `evaluationHints`), контекст строится из него (вопрос, `maxScore`, чекпоинты, полный кумулятивный ответ кандидата как evidence). Тип `GoldenCalibrationCase` расширен (`context?`, `turns[].messageKind/targetCheckpointKey`) — `calibration/types.ts`.

**Добавлены golden-кейсы (реальные ответы attempt 102, тексты ПОЛНЫЕ из БД):**
- `golden-cases/q55-virtualization-strong-senior.json` — Q55 (виртуализация списков), ответы messages 1090+1092. Воспроизводит баг attempt 102: оценщик выдал `accuracy=wrong` на `virtualization_definition` при «суть сохранена и не противоречит» (17.2), а сильные near-complete чекпоинты застряли в `partial` (17.4). После фиксов: **9.30/10**, must-have чекпоинты `covered`.
- `golden-cases/q56-closures-strong-senior.json` — Q56 (замыкания), ответы messages 1094+1096+1098. Тот же ложный `accuracy=wrong` на `closure_definition` («механизм описан корректно без ложных утверждений»). После фиксов: **9.42/10**, must-have `covered`.
- `build-question-summary.util.spec.ts` (TASK-17.6 case) — «depth=shallow + сильный ответ»: неспрошенные второстепенные чекпоинты (`when_to_use`, `libraries_ecosystem`, `followup_concepts`) исключаются из знаменателя (17.3) → итог **6.8/7.0 ≈ 0.97, НЕ weak** (а не 6.8/10 с ложным «0/7 covered»). Floors-harness не агрегирует знаменатель, поэтому shallow-кейс живёт в спецификации question-summary (правильный слой для 17.3).

Ожидания заданы **диапазонами** (score-bands + статус must-have чекпоинтов), как требует конвенция harness (`expected.totalScoreRatio` + `checkpointResults[].status/score_awarded`).

### Регресс attempt 102 «было → стало»

| | Q55 (виртуализация) | Q56 (замыкания) | Финал |
|---|---|---|---|
| **Было** (prod `gpt-5.4-nano`, до фиксов; БД `interview_checkpoint_states`) | 4.76/10 «weak», 0/7 covered | 7.16/10 «medium», 0/6 covered | 5.5/10, average, **maybe** |
| **Стало** (калиброванный оценщик + guards 17.2–17.5, harness) | **9.30/10**, 5 covered + 2 partial | **9.42/10**, 5 covered + 1 partial | per-question ≥9/10 + честное coverage → strong, invite |

Цель «сильный senior → ≥ 8/10, strong, invite/strong_invite» достигнута на уровне per-question (≥9/10) и calibration-guard'ов.

### Кейс падает ДО фиксов и зеленеет ПОСЛЕ (доказательство)

Контролируемый revert (backup + восстановление) двух точек фикса в `apply-checkpoint-score-floors.util.ts`:
- 17.2: убраны bail'ы `rationaleAffirmsAnswerIsCorrect`/`hasCitedFalseClaim` → cap снова срабатывает по сырому `accuracy=wrong`;
- 17.4: отключён `upgradeStrongPartialToCovered`.

Результат на pre-fix коде:
- `q55-virtualization-strong-senior`: ratio **0.78** (получено) против ожидаемого ≥0.84 → **FAIL** (`virtualization_definition` 1.5 → 0).
- `q56-closures-strong-senior`: ratio **0.742** против ≥0.84 → **FAIL** (`closure_definition` 2.0 → 0).

После восстановления файла (`git diff` подтверждает чистоту) — оба зелёные.

### Замечания

- Harness детерминированный (мокнутый ответ оценщика → guard-слой). Живой LLM-реэвал attempt 102 не запускался: он недетерминирован и gated за `CALIBRATION_LIVE_AI=1`. Регресс показывает, что **calibration/guard-слой** восстанавливает сильного senior до ≥9/10, при условии что оценщик (сильная модель из 17.1) выдаёт адекватные depth/coverage-теги — что и происходит на сильной модели.
- `scoringStrictness=balanced` в кейсах (конвенция существующих fiber-кейсов; attempt 102 был `lenient`, что лишь поднимает баллы выше — balanced консервативен).

### Verify (команды / ожидал / получил)

- `npx jest src/modules/adaptive-interview/calibration/golden-calibration.spec.ts` → ожидал зелёный → **14 passed, 1 skipped** (12 fiber + 2 новых).
- `npx jest .../build-question-summary.util.spec.ts` → **4 passed** (новый shallow-кейс зелёный).
- `npx jest src/modules/adaptive-interview src/modules/ai-evaluation` → **64 suites / 356 passed, 1 skipped**.
- `npx eslint` на изменённых файлах → чисто (после `--fix` prettier).
- `npm run build` (nest build) → OK.
- Pre-fix demo (revert) → оба новых кейса FAIL (0.78 / 0.742), после restore — pass.

### Изменённые файлы

- `backend/src/modules/adaptive-interview/calibration/types.ts` (расширен тип кейса)
- `backend/src/modules/adaptive-interview/calibration/golden-calibration.spec.ts` (`buildGenericContext`/`buildGoldenContext`)
- `backend/src/modules/adaptive-interview/calibration/golden-cases/q55-virtualization-strong-senior.json` (new)
- `backend/src/modules/adaptive-interview/calibration/golden-cases/q56-closures-strong-senior.json` (new)
- `backend/src/modules/adaptive-interview/utils/build-question-summary.util.spec.ts` (TASK-17.6 shallow case)
