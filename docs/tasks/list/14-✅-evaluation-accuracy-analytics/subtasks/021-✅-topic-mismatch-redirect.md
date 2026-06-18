# TASK-14.21 — Topic mismatch redirect: ответ не на тот checkpoint

## Status

- [x] done

## Completion Notes

**Команды:**

```bash
cd backend
pnpm test -- topic-mismatch follow-up-policy per-turn-checkpoint-evaluation.prompt
pnpm build
```

**Ожидание / результат:**

- `topic-mismatch.util.spec`: detects useState vs useEffect; redirect template human-readable; policy returns `topic_redirect` with priority over generic probe; `redirect=asked` blocks second redirect.
- `apply-checkpoint-score-floors.util.ts`: `misunderstood_question` → provisional guard on expected checkpoint (no immediate missed 0).
- Prompt version bumped to **2.7.0** (evaluator + planner); schema accepts `misunderstood_question`.

**Реализовано:**

- `detectTopicMismatch()` + `confusionPairs` bank hints
- `follow-up-policy.util.ts` — `topic_redirect` before budget allocator
- `hooks-evaluation-hints.fixture.ts` for tests
- Turn policy block «Topic focus» in `buildInterviewPolicyTurnBlock`
- Submit service passes persisted checkpoint states to policy for mismatch heuristics
