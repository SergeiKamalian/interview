# TASK-14.2 — Golden calibration dataset + CI

Status: [x] done

## Completion Notes

- 4 кейса в `calibration/golden-cases/` (включая `react-fiber-50-50`)
- `golden-calibration.spec.ts`: mocked AI path в CI, live mode skip без `CALIBRATION_LIVE_AI=1`
- `npx jest golden-calibration.spec.ts` — green
- Секция calibration в `docs/evaluation-accuracy/README.md`

## Goal

Зафиксировать **ожидаемые scores** для синтетических transcripts, чтобы регрессии evaluator prompt/guards ловились в CI до ручного теста.

## Проблема сейчас

Есть unit tests на guards и prompt shape, но нет **end-to-end calibration** «вот transcript → вот checkpoint scores». Attempt 34 обнаружил баг только вручную.

## Решение

### 1. Структура golden set

```txt
backend/src/modules/adaptive-interview/calibration/
  golden-cases/
    react-fiber-50-50.json
    react-fiber-strong.json
    react-fiber-weak.json
    use-effect-partial.json
  golden-calibration.spec.ts
  types.ts
```

### 2. Формат кейса

```json
{
  "id": "react-fiber-50-50",
  "questionKey": "react_fiber_main",
  "description": "Deliberately mixed correct/incorrect Fiber answers",
  "turns": [
    { "role": "candidate", "content": "..." }
  ],
  "expected": {
    "checkpointResults": [
      {
        "checkpoint_key": "scheduling",
        "status": "partial",
        "score_awarded": { "min": 0.4, "max": 0.6 },
        "depth": ["false_claim", "partial_knowledge"]
      }
    ],
    "totalScoreRatio": { "min": 0.4, "max": 0.55 }
  }
}
```

### 3. Test modes

- **Mocked AI mode (CI default):** inject expected AI JSON, test guards + merge only.
- **Live AI mode (optional, skipped in CI):** `CALIBRATION_LIVE_AI=1` — дорогой, для release checklist.

### 4. Первые кейсы (приоритет)

1. `react-fiber-50-50` — из attempt 34 transcript (сохранить в fixture).
2. `react-fiber-strong` — ideal_answer paraphrase → ~7.5–8/8.
3. `react-fiber-keywords-only` → ≤2/8.
4. `react-fiber-false-scheduling` — только scheduling checkpoint partial/missed.

## Files to create

- `backend/src/modules/adaptive-interview/calibration/golden-cases/*.json`
- `backend/src/modules/adaptive-interview/calibration/golden-calibration.spec.ts`
- `backend/src/modules/adaptive-interview/calibration/types.ts`

## Requirements

- Допуск `±0.1` на per-checkpoint score в ranges.
- Total ratio band для 50/50: `0.40–0.55` (→ 5.0–6.9/10).
- Документировать в `docs/evaluation-accuracy/README.md` как запускать live mode.

## Verification

```bash
pnpm --dir backend run test -- --testPathPattern=golden-calibration
```

## Acceptance criteria

- [ ] ≥4 golden cases, Fiber 50/50 обязателен
- [ ] CI green на mocked path
- [ ] README calibration section updated

## References

- `docs/evaluation-accuracy/README.md` §4 Case Study, §9 Verification
