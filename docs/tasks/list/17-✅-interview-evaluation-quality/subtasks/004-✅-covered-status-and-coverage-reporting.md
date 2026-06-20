# TASK-17.4 — Достижимость `covered` + корректный подсчёт покрытия в финале

Status: [x] done

## Goal

Сделать статус `covered` достижимым для сильных ответов и убрать ложное «0/N checkpoints covered» из финального отчёта (оно сейчас попадает в weaknesses/risks и снижает рекомендацию).

## Depends on

- TASK-17.2, TASK-17.3.

## Context

Доказательства из attempt 102:
- Ни один чекпоинт не дошёл до `covered` — максимум `partial` (даже при confidence 0.85).
- `final_evaluations.detailed_summary`: `Q55 scored 4.76/10 with 0/7 checkpoints covered` и `Q56 ... 0/6 checkpoints covered`.
- Эти «0/7», «0/6» занесены в `weaknesses` и `risks` (`Low checkpoint coverage ... suggests incomplete alignment`) → рекомендация занижена до `maybe`.

Статусы чекпоинта (enum): `unseen, covered, partial, missed, unclear, skipped`. Сейчас «покрытием» в финале считается только `covered`.

## Scope

- Логика статуса в оценщике/гардах (`apply-checkpoint-score-floors.util.ts`, при необходимости `merge-checkpoint-evaluation.util.ts`): `partial` с высокой confidence и высоким `score/max` должен апгрейдиться до `covered` (определить порог, напр. score ≥ 0.8·max и confidence ≥ 0.7). Не менять критерии банка.
- Финал: `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts` + `.../prompts/final-evaluation.prompt.ts`:
  - «покрытием» считать `covered` + засчитывать `partial` (например как 0.5) — пересмотреть метрику `X/N covered`;
  - не заносить высокое/среднее покрытие в `weaknesses`/`risks`;
  - убедиться, что нарратив не противоречит баллу (если балл высокий — не писать «low coverage»).
- Проверить источник `questionSummaries` (`evidenceContext.questionSummaries`) — откуда берётся «0/7 covered» (вероятно `question-summary.service.ts`), и починить там же.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Unit: сильный `partial` (score≥0.8·max, conf≥0.7) → `covered`; финал по набору сильных чекпоинтов даёт корректный `X/N covered` (не 0).
- `golden-calibration.spec.ts` зелёный.
- Регресс attempt 102: финал больше не пишет «0/7 covered», покрытие отражает реальность, рекомендация поднимается.

## Completion Notes

### Пороги апгрейда `partial → covered`

Новая функция `upgradeStrongPartialToCovered()` в `apply-checkpoint-score-floors.util.ts` (применяется финальным проходом в основном evaluated-ветке `applyCheckpointScoreFloors`, после всех guard'ов/merge). Апгрейд срабатывает ТОЛЬКО когда выполнены ВСЕ условия:

- `status === 'partial'` и `maxScore > 0`;
- `scoreAwarded / maxScore ≥ 0.8` (`COVERED_UPGRADE_SCORE_RATIO`);
- `confidence ≥ 0.7` (`COVERED_UPGRADE_MIN_CONFIDENCE`);
- rationale НЕ содержит признаков противоречия/cap (`hasFalseClaimInRationale`, `semantic guard capped`, `depth=false_claim`);
- rationale НЕ помечен `Shallow accept floor applied.` (иначе это поверхностный basic-tier ответ, принятый без probe — он обязан остаться `partial`);
- **глубина и полнота реальные**: `depth ∈ {understands, knows}` И `coverage = high` (через `parseDepthFromRationale`/`parseCoverageFromRationale`).

Почему такой порог: причина «covered недостижим» — `enforceStatusScoreAlignment` принудительно опускает `covered→partial` при `score < max`. Поэтому уверенный почти-полный ответ навсегда застревал в `partial` и давал «0/N covered». Голый порог «score ≥ 0.8·max + conf ≥ 0.7» (как в ТЗ) недостаточен: shallow-accept floor искусственно поднимает balл basic-tier ответа до ≥0.8 при `depth=partial_knowledge` — такой нельзя называть `covered`. Поэтому добавлены гейты по depth/coverage и shallow-accept marker. Это **не меняет балл** и не трогает критерии банка — только финальный статус.

### Покрытие в финале

- `build-question-summary.util.ts`: строка summary переписана с `"{covered}/{всего чекпоинтов банка} checkpoints covered"` на `"{covered+partial}/{assessed} checkpoints addressed ({covered} covered, {partial} partial). Score X/Y."`. Покрытие = `covered + partial`; знаменатель — число **реально оценённых** чекпоинтов (TASK-17.3), а не полный набор банка. Это и есть источник ложного «0/7 covered» (через `final-evidence-context.util.ts` → `summary.summary`).
- `final-evaluation.prompt.ts` (2.0.0 → 2.1.0): добавлены guardrail-правила — coverage = covered + partial; «addressed» нельзя называть missing/low; нарратив обязан согласовываться с баллом (не писать «low coverage» при высоком score вопроса ≥70% max); coverage-риск поднимать только при реально низком score (<50% max) или явном missed/contradiction.

### Нарратив до/после (структурно)

- **До**: per-question summary «0/7 checkpoints covered» → модель финала заносила «Low checkpoint coverage … suggests incomplete alignment» в `weaknesses`/`risks` → рекомендация занижалась до `maybe`.
- **После**: summary «5/6 checkpoints addressed (4 covered, 1 partial). Score 8.2/9.» + промпт-правила → нет ложного «0/N», нормальное покрытие не уходит в risks, нарратив не противоречит высокому баллу.

### Команды / ожидания / результат

- `pnpm -C backend build` → **OK** (exit 0).
- `npx jest apply-checkpoint-score-floors.util.spec` — новый describe `upgradeStrongPartialToCovered` (6 кейсов): upgrade сильного partial→covered; не апгрейдит при низком ratio / низком confidence / shallow-accept floor / contradiction rationale / non-partial — **зелёные**.
- `npx jest build-question-summary.util.spec` — 3 кейса (формат summary не ломает существующие ассерты) — **зелёные**.
- `npx jest src/modules/adaptive-interview src/modules/ai-evaluation` → **63 suites / 348 passed / 1 skipped**.
- `npx jest golden-calibration` — **зелёная**. Промежуточно ловил регресс: кейс `react-fiber-basic-tier-shallow-accept` (shallow-accept floor поднимает balл до ≥0.8, depth=partial_knowledge) начал апгрейдиться в covered → исправлено гейтами shallow-accept + depth/coverage; после фикса кейс снова `partial`, без регрессов в обе стороны.
- targeted eslint по всем изменённым файлам → чисто.

### Регресс attempt 102

«Было/стало» по attempt 102 как закрывающую цель НЕ запускал (TASK-17.6). Структурно: сильные partial (depth=understands/knows, coverage=high, conf≥0.7) теперь достигают `covered`; финал больше не получает «0/N covered» и не плодит ложные coverage-риски.
