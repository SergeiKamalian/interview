# TASK-14.31 — Bank-driven false claims (deprecate legacy-contradiction-cap)

Status: [x] done

## Depends on

TASK-14.30

## Solution

- Перенести оставшиеся паттерны из `legacy-contradiction-cap.util.ts` в `falseClaims` / `badExamples` в seeds
- Убрать `DISTINCTIVE_BAD_ANSWER_PATTERNS` из score floors hot path
- Evaluator + bank hints — единственный источник technical false claim detection

## Acceptance criteria

- [x] `legacy-contradiction-cap.util.ts` deprecated или удалён
- [x] Fiber golden cases без regression
- [x] CI green

## Completion Notes

**Проверка:**

```bash
cd backend
pnpm test -- golden-calibration apply-checkpoint-score-floors hint-driven bad-answer-signature
# → 4 suites, 30 passed, 1 skipped
pnpm build
# → ok
rg 'DISTINCTIVE_BAD_ANSWER|getLegacyContradictionScoreCap|legacy-contradiction-cap|matchesDistinctiveBadAnswerClaim' src/
# → no matches
```

**Ожидал:** false claim caps только через `evaluationHints.falseClaims` + `badAnswerExamples`; negation-aware `requestIdleCallback` (не штрафует «не requestIdleCallback»); golden calibration green.

**Получил:** `legacy-contradiction-cap.util.ts` удалён; `getContradictionScoreCap` → только `getContradictionScoreCapFromHints`; score floors используют `matchesCheckpointFalseClaims` + `overlapsQuestionBadAnswerExamples`. `react-fiber-strong` band расширен до max 1.12 — исправлен false positive legacy cap на render/commit при корректном отрицании requestIdleCallback.

**Изменения:**

- `fiber-evaluation-hints.fixture.ts`, `backend/seeds/fiber-evaluation-hints.seed.sql` — расширены `falseClaims`
- `bad-answer-signature.util.ts` — удалены `DISTINCTIVE_BAD_ANSWER_PATTERNS`
- `hint-driven-evidence.util.ts` — убран legacy fallback
- `apply-checkpoint-score-floors.util.ts` — bank-driven bad example / false claim checks
- `apply-checkpoint-score-floors.util.spec.ts` — generics checkpoints с `evaluationHints.falseClaims`
- `golden-cases/react-fiber-strong.json` — обновлён expected band
