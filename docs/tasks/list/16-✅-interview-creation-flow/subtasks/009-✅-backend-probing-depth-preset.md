# TASK-16.9 — Backend: probing depth preset → limits override

Status: [x] done

## Goal

Сделать глубину копания (shallow/balanced/deep) управляемой из настроек интервью.

## Depends on

- TASK-16.7.

## Context

- Follow-up бюджет сейчас глобальный (env + bank hints), не per-interview.
- Ключевые точки:
  - `backend/src/modules/adaptive-interview/config/adaptive-interview-context.config.ts` (`getAdaptiveInterviewContextLimits()`: `maxFollowUpsPerQuestion`, `questionScoreSufficientRatio`, `minPriorityToProbe`)
  - `utils/follow-up-budget-allocator.util.ts`
  - early stop в `utils/follow-up-policy.util.ts`
- Фундамент готов: TASK-14.19 (budget allocator), 14.4 (early stop), 14.26 (min probes).

## Scope

- Маппинг `probingDepth` → override лимитов per-interview:
  - shallow: меньше follow-ups, выше sufficient ratio (раньше стоп);
  - balanced: текущие дефолты;
  - deep: больше follow-ups, ниже sufficient ratio (дольше копает).
- Прокинуть override через packet (16.7) в расчёт лимитов; не ломать bank-level overrides (per-checkpoint `probePolicy`).
- Bank-level hints имеют приоритет там, где заданы явно — зафиксировать политику слияния в Notes.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Smoke: на одинаковом ответе `deep` задаёт больше follow-ups, `shallow` — меньше/раньше стоп.

## Completion Notes

**Сделано:**
- `config/adaptive-interview-context.config.ts`: новая чистая функция `applyProbingDepthToLimits(limits, probingDepth)` (+ helper `clamp01`). Override только question-level рычагов follow-up:
  - **shallow**: `maxFollowUpsPerQuestion` /2 (4→2), `maxFollowUpsHeavyCheckpoint` −1 (2→1), `questionScoreSufficientRatio` −0.15 (0.85→0.70, раньше стоп), `minPriorityToProbe` +0.15 (0.15→0.30, только высокоприоритетные).
  - **balanced**: без изменений (no-op, дефолты).
  - **deep**: `maxFollowUpsPerQuestion` +2 (4→6), `maxFollowUpsHeavyCheckpoint` +1 (2→3), `questionScoreSufficientRatio` +0.10 (0.85→0.95, дольше копает), `minPriorityToProbe` −0.10 (0.15→0.05, копает и низкоприоритетные gaps).
- Проброс override (берёт `probingDepth` из packet 16.7) в трёх точках:
  - `services/follow-up-policy.service.ts` — авторитетное решение `shouldAskFollowUp` / early-stop / budget (через `FollowUpPolicyInput`). Лимиты теперь = `applyProbingDepthToLimits(getAdaptiveInterviewContextLimits(), context.probingDepth)`.
  - `services/adaptive-interview-context.service.ts` — лимиты в packet (`followUpLimits.maxPerQuestion`) считаются с учётом `interview.probingDepth` → консистентный budget-блок.
  - `utils/build-interview-policy-turn-block.util.ts` (`resolveBudgetConfigFromContext`) — budget prompt-блок, показываемый LLM, использует те же depth-adjusted лимиты (без двойного применения: `maxFollowUpsPerQuestion` берётся из уже-скорректированного `context.followUpLimits.maxPerQuestion`).
- Spec: новый `config/adaptive-interview-context.config.spec.ts` — balanced=no-op, монотонность shallow<balanced<deep по `maxFollowUpsPerQuestion`/`heavyCap`/`sufficientRatio`, обратная по `minPriorityToProbe`, clamp в [0,1], отсутствие мутации входа.

**Политика слияния с bank-level (зафиксировано):** per-checkpoint `probePolicy` из question bank имеет ПРИОРИТЕТ там, где задан явно. В `follow-up-budget-allocator.util.ts` `resolveMinPriorityToProbe` = `hints.probePolicy.minPriorityToProbe ?? config.minPriorityToProbe`, а `maxFollowUpsForCheckpoint` = `hints.probePolicy.maxFollowUps ?? (tier/heavy-логика)`. `applyProbingDepthToLimits` меняет ТОЛЬКО глобальные `config`-дефолты (question-level `maxFollowUpsPerQuestion`/`questionScoreSufficientRatio` + fallback `minPriorityToProbe`/`maxFollowUpsHeavyCheckpoint`), которые применяются, когда банк молчит. Bank-level per-checkpoint значения не перетираются. Инвариант: `max_score`/checkpoints/критерии не затронуты — меняется только разговор и follow-up-бюджет.

**Верификация:**
- `pnpm -C backend run build` → OK (после правок и prettier).
- Targeted eslint на изменённые файлы → clean (config.ts/.spec.ts/2 service-файла). В `build-interview-policy-turn-block.util.ts` остаются ТОЛЬКО pre-existing prettier-замечания не на моих строках (мой diff — import + 4 строки).
- Unit: `npx jest adaptive-interview-context.config adaptive-interview-context.service follow-up-policy build-interview-policy-turn-block follow-up-budget-allocator` → 9 suites / 45 tests passed.
- Регресс: `npx jest src/modules/adaptive-interview src/modules/interview-core` → 53 suites / 310 passed, 1 skipped (ERROR в логе — ожидаемый negative-path тест валидатора). Без регрессий.
- Smoke (node на dist) на одинаковом базовом limits: `shallow {maxFUPerQ:2, heavyCap:1, sufficientRatio:0.70, minPriority:0.30}` / `balanced {4, 2, 0.85, 0.15}` / `deep {6, 3, 0.95, 0.05}`. Ожидал: deep → больше follow-ups и позже стоп, shallow → меньше и раньше стоп. Получено: монотонный градиент — подтверждено.
