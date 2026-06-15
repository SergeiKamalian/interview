# ✅ TASK-07.7 — Расчет score по категориям

Status: [x] done

## Completion Notes

**Сделано:**

- `ScoringModule` + `ScoringService` — category breakdown по topic/level/difficulty.
- Нормализация 0–100, `totalScoreOutOfTen` 0–10, пороги через `SCORE_THRESHOLD_*` env.
- Детерминированные `category` и `hireRecommendation` без опоры на AI summary.
- Unit tests: empty, mixed, all-not-met.

**Проверки:** `npm run test -- scoring` · OK
