# TASK-14.20 — Transitive checkpoint floors («20123×324 → 2×4»)

## Status

- [x] done

## Completion Notes

**Команды:**

```bash
cd backend
pnpm test -- transitive-checkpoint-floors apply-checkpoint-score-floors golden-calibration
pnpm build
```

**Ожидание / результат:**

- `transitive-checkpoint-floors.util.spec`: strong scheduling → lanes floor 0.75; weak source → no applications; stack_vs_fiber integration raises fiber_definition ≥ 0.82.
- `apply-checkpoint-score-floors.util.spec`: all existing guards green after two-pass transitive integration.
- Golden score calibration excludes `transitive-*` JSON (state-based cases tested in unit spec).

**Реализовано:**

- `impliesCheckpointFloors` + parser in `checkpoint-evaluation-hints.type.ts`
- `transitive-checkpoint-floors.util.ts` — pure `applyTransitiveCheckpointFloors()` with strict source preconditions
- Integration in `apply-checkpoint-score-floors.util.ts` (after direct guards, before merge)
- Turn prompt block via `formatTransitiveFloorsPromptBlock` in `buildInterviewPolicyTurnBlock`
- Fiber fixture + `fiber-evaluation-hints.seed.sql` backfill
- `docs/question-bank/topics/react-fiber.md` — implied floors table

**Default behavior:** floor only (not covered); direct target evidence beats transitive; weak/shallow source blocked.
