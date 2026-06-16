# TASK-14.1 — Coverage vs accuracy taxonomy (понимает / знает / слышал / упомянул)

Status: [ ] todo

## Goal

Научить per-turn evaluator **различать coverage и accuracy**, чтобы «упомянул термин» не давал `covered`, а «понимает механизм» — давал.

## Проблема сейчас

Prompt v2.4.0 уже говорит «не давать credit за keyword», но AI всё равно ставит `covered` когда кандидат смешивает верное и ложное. Нет явной пошаговой checklist per checkpoint.

**Пример (Fiber / scheduling):**

```txt
Кандидат: «Fiber использует requestIdleCallback для планирования работы»
Coverage: HIGH (говорит про scheduling)
Accuracy: WRONG (механизм неверный)
Сейчас (до фиксов): covered 1.0
Нужно: partial 0.5 + red flag
```

## Решение

### 1. Расширить system prompt

Добавить обязательную **mental checklist** перед каждым checkpoint:

```txt
For EACH checkpoint, answer internally:
1. MENTION: Did the candidate name this topic? (yes/no)
2. EXPLAIN: Did they explain HOW/WHY correctly? (yes/no/partial)
3. FALSE: Any confident false claim about this topic? (yes/no)
4. DEPTH: understands | knows | heard_of | mention_only | none

Then map to status+score:
- mention_only / heard_of without correct explanation → missed or partial ≤ 0.25
- partial correct explanation → partial 0.4–0.6
- correct without false claims → covered
- false claims → partial or missed, never covered
```

### 2. Таксономия depth (для rationale)

В `rationale` AI должен явно писать уровень:

- `depth=mention_only` — только buzzwords
- `depth=heard_of` — «слышал, не помню»
- `depth=partial_knowledge` — верная идея, неполно
- `depth=understands` — связное объяснение
- `depth=knows` — точные детали
- `depth=false_claim` — уверенная ошибка

### 3. Optional: structured fields в JSON

Если решим расширить schema (согласовать с TASK-14.7):

```json
{
  "checkpoint_key": "scheduling",
  "coverage": "high",
  "accuracy": "wrong",
  "depth": "false_claim",
  "status": "partial",
  "score_awarded": 0.5
}
```

Начать можно **без migration** — depth в rationale; migration позже.

### 4. User prompt: bad examples

Подключить `bad_answer_examples` из snapshot (2–3 релевантных) в `buildPerTurnCheckpointEvaluationUserPrompt`.

## Files to change

- `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.ts`
- `backend/src/modules/adaptive-interview/prompts/per-turn-checkpoint-evaluation.prompt.spec.ts`
- `backend/src/modules/adaptive-interview/types/per-turn-evaluation.types.ts` (если schema extension)
- `backend/src/modules/adaptive-interview/services/adaptive-interview-context-builder.service.ts` (bad examples в packet)

## Requirements

- Bump `PER_TURN_CHECKPOINT_EVALUATION_PROMPT_VERSION` → `2.5.0`.
- Не ломать merge monotonicity (score не уменьшается).
- Backward compatible: старые attempts не пересчитываются.

## Verification

- Unit: prompt contains checklist + depth taxonomy.
- `apply-checkpoint-score-floors.util.spec.ts` Fiber scenario green.
- Manual: Fiber 50/50 → raw score заметно ниже 7/8.
- `pnpm --dir backend run test`.

## Acceptance criteria

- [ ] Prompt явно разделяет mention vs explain vs false claim
- [ ] Rationale содержит depth level
- [ ] Bad examples в user prompt
- [ ] Fiber 50/50 regression улучшен vs baseline f93b32b

## References

- `docs/evaluation-accuracy/README.md` §2 Glossary, §5.1
- Commit baseline: `f93b32b`
