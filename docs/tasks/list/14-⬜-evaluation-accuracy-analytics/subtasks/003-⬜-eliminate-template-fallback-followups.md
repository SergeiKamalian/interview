# TASK-14.3 — LLM follow-ups, убрать rubric template fallback

Status: [ ] todo

## Goal

Follow-up вопросы кандидату должны быть **естественными** и **не содержать rubric text** (`expected=...`). `combined_turn_template_fallback` — последний resort, не default.

## Проблема сейчас

`follow-up-planner.service.ts`:

```txt
plannerReason = 'combined_turn_template_fallback'
```

При fallback в текст попадает checkpoint `expected` → кандидат видит критерии оценки. В attempt 34 все 5 follow-ups были template fallback → робот «Понял, спасибо.» + rubric.

Частично исправлено: `follow-up-acknowledgment.util.ts` — variety ack, но fallback остаётся.

## Решение

### 1. Retry chain (до fallback)

```txt
1. follow-up-planner LLM (combined turn)
2. validation fail → follow-up-planner-repair.prompt (уже есть)
3. repair fail → simplified LLM call (question only, no rubric in output schema)
4. last resort → conversational generic probe (NO expected text)
```

### 2. Sanitize fallback template

Если template неизбежен:

```txt
BAD:  «Понял. Расскажите подробнее про expected: Fiber использует...»
GOOD: «Интересно. Можете подробнее про то, как React планирует обновления в Fiber?»
```

Использовать `checkpoint.title` (human), **не** `checkpoint.expected` (rubric).

### 3. Metrics

Логировать `plannerReason` в usage/analytics:

- `combined_turn_llm`
- `repair_success`
- `combined_turn_template_fallback` — target < 5%

### 4. Validation rules

Reject follow-up if:

- contains `expected=`
- length > N chars
- duplicates prior follow-up verbatim

## Files to change

- `backend/src/modules/adaptive-interview/services/follow-up-planner.service.ts`
- `backend/src/modules/adaptive-interview/prompts/follow-up-planner.prompt.ts`
- `backend/src/modules/adaptive-interview/prompts/follow-up-planner-repair.prompt.ts`
- `backend/src/modules/adaptive-interview/utils/checkpoint-expected-speech.util.ts`
- `backend/src/modules/adaptive-interview/services/follow-up-planner.service.spec.ts`

## Requirements

- Не увеличивать latency > +1s p95 (repair уже async).
- Voice mode: TTS text = sanitized follow-up.

## Verification

- Unit: fallback text never contains rubric substrings from `expected`.
- Integration: force LLM validation fail → still no rubric in output.
- Manual: пройти Fiber interview, inspect `interview_messages` follow_up content.

## Acceptance criteria

- [ ] Retry chain implemented
- [ ] Template fallback uses title-only conversational probe
- [ ] `combined_turn_template_fallback` rate measurable
- [ ] Specs for rubric leak prevention

## References

- `docs/evaluation-accuracy/README.md` §5.3
- `follow-up-planner.service.ts` line ~209
