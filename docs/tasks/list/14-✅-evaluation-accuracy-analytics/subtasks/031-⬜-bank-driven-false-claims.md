# TASK-14.31 — Bank-driven false claims (deprecate legacy-contradiction-cap)

Status: [ ] todo

## Depends on

TASK-14.30

## Solution

- Перенести оставшиеся паттерны из `legacy-contradiction-cap.util.ts` в `falseClaims` / `badExamples` в seeds
- Убрать `DISTINCTIVE_BAD_ANSWER_PATTERNS` из score floors hot path
- Evaluator + bank hints — единственный источник technical false claim detection

## Acceptance criteria

- [ ] `legacy-contradiction-cap.util.ts` deprecated или удалён
- [ ] Fiber golden cases без regression
- [ ] CI green
