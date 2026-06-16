# TASK-14.5 — False claim penalty hardening

Status: [ ] todo

## Goal

Усилить post-guards и prompt так, чтобы **уверенные ложные утверждения** всегда срезали score, даже если AI поставил `covered`.

## Проблема сейчас

`apply-checkpoint-score-floors.util.ts` уже имеет:

- `applySemanticContradictionCap` — Fiber-specific patterns
- `applyRationaleContradictionCap` — если rationale mentions incorrect/contradictory
- `enforceStatusScoreAlignment` — covered требует max score consistency

Но patterns **узкие** (только Fiber). Другие вопросы уязвимы. AI может не писать «incorrect» в rationale.

## Решение

### 1. Generic rationale patterns (language-agnostic RU/EN)

```txt
incorrect | wrong | contradictory | неверно | ошибочно | не так | противореч
```

Если `status=covered` и rationale matches → cap to partial.

### 2. Question-bank driven false patterns

В context packet добавить `bad_answer_examples` → guards check candidate text similarity / keyword overlap with bad examples → cap score.

### 3. Per-checkpoint false claim keywords (optional seed metadata)

Долгосрочно: `checkpoint.false_claim_patterns` в question bank. Краткосрочно: derive from bad examples.

### 4. Red flag emission

При cap логировать:

```json
{ "type": "false_claim_cap", "checkpoint_key": "...", "pattern": "..." }
```

Для TASK-14.9 и TASK-14.11.

## Files to change

- `backend/src/modules/adaptive-interview/utils/apply-checkpoint-score-floors.util.ts`
- `backend/src/modules/adaptive-interview/utils/apply-checkpoint-score-floors.util.spec.ts`
- Context builder — include bad examples

## Verification

- Extend Fiber spec cases
- Add useEffect false claim case
- All existing guard specs green

## Acceptance criteria

- [ ] Generic rationale contradiction cap (RU+EN)
- [ ] Bad example overlap cap
- [ ] ≥2 question topics covered in specs
- [ ] No false positive on strong correct answers

## References

- `docs/evaluation-accuracy/README.md` §5.2
- `apply-checkpoint-score-floors.util.ts`
