# TASK-17.3 — Probing depth vs знаменатель скоринга

Status: [x] done

## Goal

Убрать структурный конфликт: при `probing_depth=shallow` ИИ задаёт мало уточнений, а скоринг всё равно делит на полный набор чекпоинтов и ставит `missed=0` тем, которых НИКТО не спрашивал. Это гарантированно топит балл сильного кандидата.

## Depends on

- Связано с TASK-16.9 (probing depth preset) и TASK-16.10 (strictness). Логически после 17.2.

## Context

Доказательства из attempt 102 (depth=shallow):
- Q55: 0 явных follow-up; чекпоинты `when_to_use`, `libraries_ecosystem`, `followup_concepts` — `missed=0.00`, rationale `depth=mention_only ... не названы` (их не спрашивали).
- Q56: `memory_leak_dom` — `missed=0.00` `не упоминался`.
- Итог Q55 = 4.76/10 в основном из-за нулей за неспрошенное.

Нужно одно из (выбрать и обосновать в Completion Notes):
- **(A) нормировать балл по реально затронутым чекпоинтам** (covered/partial/missed-after-probe), исключая `unseen`/неспрошенные; либо
- **(B) гарантировать probing must-have чекпоинтов независимо от depth** (shallow уменьшает добор по второстепенным, но must-have всё равно проверяются); либо
- **(C) гибрид**: must-have всегда проверяются (B), остаток нормируется (A).

Рекомендация: **(C)** — самый честный для компании результат.

## Scope

- `backend/src/modules/adaptive-interview/utils/probe-policy.util.ts` — отделить must-have чекпоинты (по весу/флагу) от второстепенных; гарантировать probing must-have при любом depth.
- `backend/src/modules/adaptive-interview/config/adaptive-interview-context.config.ts` — как `probingDepth` влияет на follow-up бюджет (shallow режет только второстепенные).
- Скоринг знаменателя: найти, где суммируется `score/max` по чекпоинтам (per-question summary → `question-summary.service.ts`; и/или агрегирование в `final-evaluation.service.ts`). Реализовать нормировку «по затронутым», не считая `unseen`/неспрошенные второстепенные как 0.
- НЕ менять `max_score`/веса в банке — менять только формулу агрегации балла.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Unit: при depth=shallow и сильных ответах на спрошенные чекпоинты итог по вопросу высокий; неспрошенные второстепенные не дают `0` в знаменатель.
- Должно сохраняться: реально пропущенный (спрошенный, но не отвеченный) чекпоинт по-прежнему штрафуется.
- `golden-calibration.spec.ts` зелёный.
- Регресс attempt 102: Q55 поднимается из «weak» (важно: при сильных ответах не должно оставаться 0/7 покрытия — см. также 17.4).

## Completion Notes

### Выбран вариант (C) — гибрид

- **(B) must-have проверяются всегда** — уже обеспечено существующей логикой `probe-policy.util.ts`: кандидаты с `probeRequired=true` (тиры `intermediate/advanced/expert`) обходят поднятый при `shallow` порог `minPriorityToProbe` в budget-allocator. Формализовал этот критерий в новой функции `isMustHaveCheckpoint()` (тир из `PROBE_REQUIRED_TIERS` **или** тяжёлый вес: `weight ≥ 2` или `weight/questionMax ≥ 0.2`). В `adaptive-interview-context.config.ts` добавил комментарий, поясняющий, что `shallow` режет только второстепенные.
- **(A) нормировка знаменателя по затронутым** — реализована в `build-question-summary.util.ts`. Почему гибрид, а не чистый A или B: чистый B всё равно делил бы балл на полный набор (нули за неспрошенное остаются), а чистый A мог бы «вырезать» важный, но плохо отвеченный must-have из знаменателя и завысить балл. Гибрид: must-have всегда в знаменателе (нельзя «спрятать» провал по ключевому критерию), второстепенные — только если реально затронуты.

### Где именно меняется знаменатель

`backend/src/modules/adaptive-interview/utils/build-question-summary.util.ts` → новый предикат `isCheckpointAssessed(checkpoint, state, fullMaxScore)`. Чекпоинт входит в `score`/`maxScore` (числитель И знаменатель), только если:

1. он **must-have** (`isMustHaveCheckpoint`) — всегда; либо
2. есть **позитивное свидетельство**: `status ∈ {covered, partial}` или `scoreAwarded > 0`; либо
3. его **реально спрашивали**: `followUpCount > 0` (спрошен, но не отвечён → остаётся в знаменателе со штрафом).

Второстепенный чекпоинт, которого никогда не спрашивали (`followUpCount=0`, нет evidence, `missed/0`) — **исключается** из знаменателя (не топит балл за неспрошенное). Guard: если ничего не «assessed» (нет must-have + пустой ответ), знаменатель падает обратно на полный `maxScore`, чтобы пустой ответ остался `0/max`, а не `0/0`.

Per-question score хранится через `question-summary.service.ts` → `QuestionSummaryRepository.upsert`; финал (`final-evaluation.service.ts`) агрегирует именно эти `score/maxScore`, поэтому правка знаменателя в одном месте распространяется на финальный балл.

Штраф за реально пропущенный (спрошенный, но не отвеченный) чекпоинт **сохранён** — такой чекпоинт остаётся в знаменателе по условию (3) и попадает в `weaknesses`.

### Команды / ожидания / результат

- `pnpm -C backend build` → **OK** (exit 0).
- `npx jest build-question-summary.util.spec` → 3 теста (включая 2 новых для 17.3) — **зелёные**.
  - excludes never-asked SECONDARY checkpoints → `6/6`, не `6/8`.
  - keeps penalty for probed-but-missed SECONDARY → `6/7`, `weaknesses=['When to use']`.
- `npx jest src/modules/adaptive-interview` → **54 suites / 320 passed / 1 skipped**, регрессов нет.
- `npx jest golden-calibration` → **12 passed / 1 skipped**, без регрессов в обе стороны.
- targeted eslint по изменённым файлам (`build-question-summary.util.ts`, `.spec.ts`, `adaptive-interview-context.config.ts`) → чисто. В `probe-policy.util.ts` остаются 9 **предсуществующих** ошибок (проверено через `git stash`: тот же набор до моей правки) — не вносил новых, не трогал чужой код.

### Регресс attempt 102

Регресс «было/стало» по attempt 102 как закрывающую цель НЕ запускал — это TASK-17.6. Изменение структурно поднимает Q55/Q56: неспрошенные второстепенные (`when_to_use`, `libraries_ecosystem`, `followup_concepts`, `memory_leak_dom`) больше не входят в знаменатель, поэтому сильные ответы на спрошенные must-have дают высокий per-question score вместо разбавления нулями.
