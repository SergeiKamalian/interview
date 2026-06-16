# TASK-14.10 — Confidence + manual review в UI

Status: [ ] todo

## Goal

Показать HR **confidence** AI по checkpoint и флаг **needs_manual_review** — когда автоматическая оценка ненадёжна.

## Проблема сейчас

Поля `confidence` и `needs_manual_review` пишутся в `interview_checkpoint_states` (block 09), но dashboard их не выделяет. HR не знает, когда доверять 8.8/10.

## Решение

### 1. UI indicators

- Per checkpoint: confidence % with color threshold
  - ≥0.85 green
  - 0.6–0.85 yellow
  - <0.6 red + «Рекомендуется ручная проверка»
- Attempt level: `needsManualReview` if any checkpoint flagged

### 2. Filters

На списке attempts: filter «Требует ручной проверки».

### 3. HR action (optional)

Button «Отметить проверено» — future, не обязательно в этом subtask.

## Files to change

- `frontend/src/pages/dashboard/` interview list + details
- GraphQL — ensure fields exposed

## Verification

- Mock low confidence state → yellow/red badge
- Filter returns only flagged attempts

## Acceptance criteria

- [ ] Confidence visible per checkpoint
- [ ] needs_manual_review badge on attempt
- [ ] List filter works

## References

- `docs/evaluation-accuracy/README.md` §5.5 (items D, N)
- Block 09 per-turn evaluator output contract
