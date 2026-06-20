# TASK-16.10 — Backend: scoring strictness preset → rubric + guards

Status: [x] done

## Goal

Сделать строгость оценки (lenient/balanced/strict) управляемой из настроек интервью.

## Depends on

- TASK-16.7.

## Context

- Строгость сейчас глобальная: rubric prompt + детерминированные guards.
- Ключевые точки:
  - `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.ts` (rubric, score bands)
  - `utils/apply-checkpoint-score-floors.util.ts` (`falseClaimCapFraction`, `positiveFloorScore`, shallow-accept fractions)
  - bank defaults в `utils/hint-driven-evidence.util.ts`

## Scope

- Маппинг `scoringStrictness` → профиль:
  - множители на caps/floors guards (strict жёстче режет partial/false claim, lenient мягче);
  - вариант rubric-текста/score-bands в evaluator prompt.
- ВАЖНО (инвариант): НЕ менять `max_score`, checkpoints, критерии. Меняются только пороги/строгость закрытия, не структура.
- Зафиксировать в Notes, что bank-level hints не перетираются полностью, а масштабируются.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Smoke: одинаковый partial-ответ при `strict` получает ниже балл, при `lenient` — выше; при этом `max_score` неизменен.
- Golden: прогнать существующий golden calibration (блок 14) на `balanced` → отсутствие регрессий.

## Completion Notes

### Что сделано

`scoringStrictness` (lenient/balanced/strict) из packet (16.7) теперь управляет строгостью
закрытия чекпоинтов через единый множитель на детерминированные guards + вариант rubric-текста
в evaluator-промпте. `max_score`, чекпоинты и критерии НЕ меняются.

**Новый util** `utils/scoring-strictness.util.ts`:

- `getScoringStrictnessScoreMultiplier(scoringStrictness)` → `strict=0.85`, `lenient=1.15`,
  `balanced`/`undefined`=`1`.
- `scaleGuardScore(value, maxScore, multiplier)` — масштабирует cap/floor и клампит в `[0, maxScore]`.
  При `multiplier === 1` (balanced) возвращает значение БЕЗ изменений → точный no-op.

**Guards** в `utils/apply-checkpoint-score-floors.util.ts` — множитель резолвится один раз из
`context.scoringStrictness` и протянут во все cap/floor:

- `applyRationaleContradictionCap`, `applySemanticContradictionCap`, `applyBadExampleOverlapCap`
  (caps → strict режет ниже, lenient мягче);
- `applyExplicitRefusalCap`, `applyShallowAcceptFloor`, `applyPositiveEvidenceFloor`,
  `resolveProvisionalScoreFloor`, `applyRationaleScoreAlignment` (floors → strict подпирает меньше,
  lenient больше).

**Rubric** в `prompts/per-turn-checkpoint-evaluation.prompt.ts`:
`buildPerTurnCheckpointEvaluationSystemPrompt(scoringStrictness?)` добавляет блок STRICT/LENIENT
(куда внутри существующих band-ов попадает ответ). При `balanced`/`undefined` блок = `null` →
промпт байт-в-байт прежний (golden calibration не затронут). Протянуто через
`buildEvaluateConversationSystemPrompt(combinedTurn, scoringStrictness)` и все 4 вызова в
`per-turn-checkpoint-evaluator.service.ts`.

### Политика bank-level hints (не перетираются, масштабируются)

Bank-level подсказки (`falseClaimCapFraction`, `positiveFloorScore`, shallow-accept fractions)
вычисляют cap/floor как раньше; strictness применяется ПОВЕРХ — `scaleGuardScore(computedValue, …)`.
Т.е. банк остаётся source of truth для базового значения, strictness лишь сдвигает порог.

### Инвариант

`max_score`/чекпоинты/структура не меняются: все scaled-значения клампятся в `[0, maxScore]`,
множитель влияет только на порог закрытия чекпоинта.

### Команды / ожидание / результат

- `pnpm -C backend build` → **OK** (exit 0).
- targeted eslint на изменённых файлах → чисто, кроме 2 **pre-existing** ошибок в
  `apply-checkpoint-score-floors.util.ts` (`fullCandidateText`, `GuardDraft` unused) — подтверждено
  через `git stash`: те же ошибки есть в исходном файле до правок.
- `npx jest scoring-strictness.util.spec.ts apply-checkpoint-score-floors.strictness.spec.ts` →
  **7 passed**. Один и тот же partial false-claim-ответ: `strict < balanced < lenient`, при этом
  балл всегда в `[0, max_score]`; balanced/undefined = no-op.
- Golden calibration (`calibration/golden-calibration.spec.ts`) → **12 passed, 1 skipped**.
  Golden-кейсы не задают `scoringStrictness` → ветка balanced → нет регрессий.
- Полный прогон `npx jest src/modules/adaptive-interview` → **54 suites, 316 passed, 1 skipped**.

### Новые / изменённые файлы

- new: `utils/scoring-strictness.util.ts`
- new: `utils/scoring-strictness.util.spec.ts`
- new: `utils/apply-checkpoint-score-floors.strictness.spec.ts`
- mod: `utils/apply-checkpoint-score-floors.util.ts`
- mod: `prompts/per-turn-checkpoint-evaluation.prompt.ts`
- mod: `prompts/adaptive-ai-conversation.prompt.ts`
- mod: `services/per-turn-checkpoint-evaluator.service.ts`
