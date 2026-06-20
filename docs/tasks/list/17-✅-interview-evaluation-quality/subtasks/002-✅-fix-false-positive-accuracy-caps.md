# TASK-17.2 — Фикс ложных false_claim / accuracy=wrong (cap корректных ответов)

Status: [x] done

## Goal

Перестать срезать балл корректным ответам. Сейчас правильное определение помечается `accuracy=wrong` / `depth=false_claim` → срабатывает contradiction-cap, хотя rationale сам признаёт «суть сохранена и не противоречит».

## Depends on

- Желательно после TASK-17.1 (на сильной модели ложных срабатываний станет меньше — но логику всё равно чиним).

## Context

Доказательства из attempt 102 (`interview_checkpoint_states`):
- `virtualization_definition`: `accuracy=wrong ... суть виртуализации сохранена и не противоречит. depth=false_claim. Score capped: rationale notes material errors.` → 0.86/1.5.
- `closure_definition`: `accuracy=wrong ... механизм замыкания описан корректно без ложных утверждений. depth=false_claim. Score capped` → 1.15/2.0.
- `evidence_summary` нерелевантен: берётся первое предложение ≥24 символов (`extractFalseClaimQuote` в `false-claim-quote.util.ts`), а не реальная ошибочная фраза.

Это значит: cap применяется без реально процитированной противоречащей фразы — на основании «сырого» флага модели.

## Scope

- `backend/src/modules/adaptive-interview/utils/apply-checkpoint-score-floors.util.ts` (1287 строк, контейнер логики):
  - contradiction-cap / false_claim-cap применять ТОЛЬКО при наличии реально найденной противоречащей фразы (matched quote через `extractMatchedFalseClaimQuote` + `matchesCheckpointFalseClaims` из `bad-answer-signature.util.ts`), а не по «сырому» сигналу модели;
  - если rationale указывает на корректность (`rationaleIndicatesSoundEvidence` / фразы «не противоречит», «корректно», «без ложных утверждений») — cap не вешать.
- `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.ts` и `.../prompts/adaptive-ai-conversation.prompt.ts`:
  - ужесточить инструкцию: `accuracy=wrong` / `false_claim` ставить ТОЛЬКО при конкретной процитированной фактической ошибке; иначе `accuracy=partial/correct`. Запретить помечать «wrong» при «суть верна, но неполно» (это `partial`, не `wrong`).
- Сверить взаимодействие с `scoring-strictness.util.ts`: при `lenient` floor'ы не должны перебиваться ложным cap (см. TASK-17.4/strictness в README).

## Verification

- `pnpm -C backend build` + targeted eslint.
- Unit-тесты util: корректный ответ без процитированной ошибки → cap НЕ применяется; ответ с реальной процитированной ошибкой → cap применяется (golden-кейсы `false-claim` уже есть в `calibration/golden-cases/`).
- `golden-calibration.spec.ts` зелёный (включая `react-fiber-false-scheduling.json`, `react-fiber-scheduling-priorities-not-false.json` — не должно быть регресса в обе стороны).
- Регресс attempt 102: `virtualization_definition` и `closure_definition` больше не `accuracy=wrong`, балл по ним близок к max.

## Completion Notes

### Что изменено

**Guard-логика — `utils/apply-checkpoint-score-floors.util.ts` → `applyRationaleContradictionCap`:**

Теперь rationale-based contradiction-cap вешается ТОЛЬКО когда выполнены ВСЕ условия:
1. `score >= max` и `status === 'covered'` (как раньше);
2. rationale НЕ описывает omission (`rationaleIndicatesOmissionNotContradiction` — как раньше);
3. **NEW:** rationale НЕ подтверждает корректность ответа — добавлены два bail-условия:
   - `rationaleIndicatesSoundEvidence(...)` (accuracy=full / partial+positive без negatives);
   - `rationaleAffirmsAnswerIsCorrect(...)` — узкие паттерны самопротиворечия модели: `не противоречит`, `без ложных утверждений`, `без материальных ошибок`, `суть … сохранена`, `механизм … описан корректно`, `описан корректно без …`. Паттерны намеренно узкие, чтобы НЕ ловить honest half-right rationale («суть верна, но X не соответствует»);
4. rationale содержит маркер ошибки (`admitsError` — как раньше);
5. **NEW (главное):** в тексте ответа кандидата реально процитирована противоречащая фраза — `hasCitedFalseClaim(candidateText, checkpoint)` через `matchesCheckpointFalseClaims(text, checkpoint.evaluationHints.falseClaims)`. Если у чекпоинта нет настроенных `falseClaims` или ни одна не сматчилась — cap НЕ вешается, доверяем covered-баллу модели.

Передаю `evaluationText` (для targeted follow-up — latest turn, иначе checkpointEvidenceText) и `checkpoint` в функцию из call-site.

Семантический cap (`applySemanticContradictionCap` через `getContradictionScoreCap`) уже работает строго по matched false claims — он не трогался (и так compliant). Bad-example overlap cap (`applyBadExampleOverlapCap`) уже уважает `rationaleIndicatesSoundEvidence` — не трогался.

Параллельно убраны 2 pre-existing unused-symbol lint-ошибки в этом же файле (локальный `fullCandidateText`, тип `GuardDraft`, и unused-импорт `collectFullCandidateText`) — без изменения поведения.

**Промпты:**
- `prompts/per-turn-checkpoint-evaluation.prompt.ts` — версия `2.9.0 → 2.10.0`; добавлен блок «Accuracy=wrong / depth=false_claim discipline»: ставить `accuracy=wrong`/`false_claim` ТОЛЬКО при конкретной процитированной ошибке; «верно, но неполно» = `accuracy=partial`, не `wrong`; запрещено писать `accuracy=wrong`, когда rationale сам говорит «суть корректна / не противоречит / описан корректно». Уточнён half-right-блок: covered=max нельзя при конкретном неверном утверждении (а не просто при отсутствии деталей).
- `prompts/adaptive-ai-conversation.prompt.ts` — наследует базовый промпт + добавлена строка-напоминание про accuracy=wrong только при cited error.

### Условия для cap (итог)

Cap корректного определения больше невозможен «по сырому флагу модели»: нужна процитированная фраза из `evaluationHints.falseClaims` банка, найденная в ответе. Source of truth (критерии/веса/max_score) не менялась.

### Verification

- `pnpm -C backend build` — OK (nest build, без ошибок).
- `npx eslint` на изменённых файлах (util + util.spec + оба промпта + prompt.spec) — **clean** (pre-existing prettier/unused-vars починены).
- Unit-тесты (`apply-checkpoint-score-floors.util.spec.ts`): добавлены 2 кейса —
  - **TASK-17.2**: covered-ответ с rationale `accuracy=wrong … суть сохранена и не противоречит` и БЕЗ процитированной false-claim → cap НЕ вешается, остаётся `1/1 covered` (это сценарий attempt-102 `virtualization_definition`/`closure_definition`).
  - **TASK-17.2**: тот же covered-ответ, но кандидат заявил настроенный false claim (`generic как any`) → cap применяется (accuracy=wrong → 0, missed).
- Golden-калибровка `golden-calibration.spec.ts` — зелёная (17 кейсов), без регресса в обе стороны: `react-fiber-false-scheduling` (false claim ловится через semantic cap, т.к. score<max → rationale-cap там не участвует) и `react-fiber-scheduling-priorities-not-false` (не капается) проходят.
- Полный прогон `src/modules/adaptive-interview` — **54 suites / 318 passed, 1 skipped**.

Ожидал: корректные ответы без процитированной ошибки не теряют балл; реальные false claims по-прежнему капаются; golden без регресса. Получил: ровно это.

Регресс «было/стало» на живом attempt 102 не запускался намеренно — это TASK-17.6. Unit-кейс TASK-17.2 моделирует именно сценарий attempt-102 (accuracy=wrong + «не противоречит» → больше не cap).
