# TASK-14.7 — Coverage vs accuracy dual axis UI

Status: [ ] todo

## Goal

Визуализировать **две оси** понимания: что кандидат затронул (coverage) vs насколько верно объяснил (accuracy). Реализовать идею «понимает / знает / слышал / упомянул» для HR.

## Проблема сейчас

Один badge `partial` не объясняет: это «слышал про Fiber» или «понимает, но ошибся в детали scheduling».

## Решение

### Phase A — Parse from rationale (no migration)

Если TASK-14.1 пишет `depth=heard_of` в rationale — UI парсит и показывает label:

| depth | UI label RU | Icon/color |
|-------|-------------|------------|
| mention_only | Упомянул | gray |
| heard_of | Слышал | yellow |
| partial_knowledge | Знает поверхностно | orange |
| understands | Понимает | blue |
| knows | Знает | green |
| false_claim | Ошибается уверенно | red |

### Phase B — Structured fields (optional migration)

Добавить `coverage_level`, `accuracy_level` в `interview_checkpoint_states` если parse fragile.

### UI mock

```txt
Checkpoint: scheduling
[Coverage ████████░░ 80%]  [Accuracy ███░░░░░░░ 30%]
Label: Упомянул тему, но объяснение неверно
```

## Dependencies

- TASK-14.1 (depth in rationale or schema)
- TASK-14.6 (checkpoint cards exist)

## Files to change

- `frontend/` — dual axis component
- Optional migration + entity types
- Evaluator types if schema extension

## Verification

- Storybook or page with mock checkpoint data
- Fiber 50/50 attempt shows high coverage / low accuracy on scheduling

## Acceptance criteria

- [ ] HR видит coverage vs accuracy (или depth label)
- [ ] Легенда «понимает/знает/слышал/упомянул» в UI
- [ ] Документировано в evaluation-accuracy README

## References

- `docs/evaluation-accuracy/README.md` §2 Glossary, §5.1
