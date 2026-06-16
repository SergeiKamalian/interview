# TASK-14.13 — Verify topic_opener not scored

Status: [x] done

## Completion Notes

- `adaptive-interview-submit.service.spec.ts`: `evaluateTurnAndPersist` не вызывается на `topic_opener_answer`
- Live flow attempt 36: оценка только после main answer

## Goal

Убедиться и зафиксировать тестами, что **topic_opener** и **topic_opener_answer** не запускают per-turn evaluator и не влияют на checkpoint states.

## Контекст

Migration `015_add_topic_opener_messages.sql` добавила kinds:

- `topic_opener` — мягкое вступление в тему
- `topic_opener_answer` — ответ кандидата «готов/да»

Flow (commit f93b32b):

```txt
welcome → topic_opener → topic_opener_answer → main reveal → main_answer → evaluation
```

## Проблема

Риск регрессии: если submit service начнёт eval на `topic_opener_answer`, кандидат получит score за «да, готов» или случайный small talk.

## Решение

### 1. Code audit

`adaptive-interview-submit.service.ts`:

- `handleTopicOpenerAnswer` — must NOT call evaluator
- Only `main_answer` and `follow_up_answer` trigger evaluation

### 2. Tests

```txt
- submit topic_opener_answer → zero evaluator calls (mock)
- checkpoint states unchanged after topic opener phase
- main_answer after opener → evaluator called once
```

### 3. Documentation

Confirm in `docs/evaluation-accuracy/README.md` §5.7 — mark verified with test file reference.

## Files to change

- `adaptive-interview-submit.service.spec.ts` — new cases
- Possibly `interview-public.service.spec.ts`

## Verification

```bash
pnpm --dir backend run test -- --testPathPattern=adaptive-interview-submit
```

## Acceptance criteria

- [ ] Explicit test: no eval on topic_opener_answer
- [ ] Code path documented in spec comments
- [ ] README §5.7 updated to ✅ verified

## References

- `main-question-opener.service.ts`
- `topic-opener.util.ts`
- Migration `015_add_topic_opener_messages.sql`
