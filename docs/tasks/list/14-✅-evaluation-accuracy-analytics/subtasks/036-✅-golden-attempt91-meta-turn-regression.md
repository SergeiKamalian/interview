# TASK-14.36 — Golden attempt #91 meta-turn regression

Status: [x] done

## Prerequisite

- [x] **TASK-14.32** — mode contract
- [x] **TASK-14.33** — submit routing
- [x] **TASK-14.34** — guards freeze
- [x] **TASK-14.35** — policy target refusal

## Контекст

- Live QA attempt #91 — classifier ok, scoring/policy broken на turn 6
- Баги GUARD-02, DECL-01, SCORE-01 в `docs/evaluation-accuracy/README.md` §16
- Существующие golden cases: `calibration/golden-cases/`

## Problem

Нет автоматической регрессии на сценарий «сильный main answer → probes → decline_scoped» — баги вернутся при изменении guards/policy.

## Solution (только этот subtask)

### 1. Golden case JSON

Файл: `calibration/golden-cases/react-fiber-attempt91-decline-scoped.json`

Минимум 2 fixture turn'а:

1. **Main answer** (substantive) — fiber_definition/render/commit partial+, scheduling partial
2. **Decline scoped** на fiber_pointers — meta turn после covered stack

Expected assertions:

- `fiber_definition.scoreAwarded` ≥ 0.85 после decline turn (не 0)
- `render_phase.scoreAwarded` ≥ 0.65 (не 0)
- `stack_vs_fiber.scoreAwarded` ≥ 0.95
- `fiber_pointers` — partial/missed (refusal), ≤ 0.55
- Policy after decline: **не** `fiber_pointers` с topic_mismatch

Подключить в `golden-calibration.spec.ts`.

### 2. Документация

- `docs/evaluation-accuracy/README.md` §16 — GUARD-02, DECL-01, SCORE-01 → **fixed** + ссылка на golden case
- `candidate-turn-classifier.md` §14 — отметить wave 4 complete criteria

### 3. Verification

```bash
cd backend && pnpm test -- golden-calibration apply-checkpoint-score-floors follow-up-policy.target-refusal adaptive-interview-submit
cd backend && pnpm build
```

Опционально (если backend up): replay script по образцу `backend/scripts/replay-attempt82-*.mjs` для attempt 91 turn 6 — не блокер, если golden unit green.

## Out of scope

- ENC-01 (отдельный subtask / bug)
- Classifier prompt changes
- Frontend dashboard

## Acceptance criteria

- [x] Golden case в CI проходит
- [x] README §16 bugs GUARD-02 / DECL-01 closed (SCORE-01 как следствие — closed или mitigated)
- [x] Wave 4 checklist в classifier doc §14 отмечен
- [x] `pnpm test` + `pnpm build` backend pass

## Completion Notes

**Команды:**

```bash
cd backend && pnpm test -- golden-calibration apply-checkpoint-score-floors follow-up-policy.target-refusal adaptive-interview-submit resolve-evaluation-mode
cd backend && pnpm build
```

**Expected:** 5 suites pass (golden-calibration включает `react-fiber-attempt91-decline-scoped`); build ok.

**Got:**

- `Test Suites: 5 passed, 5 total`
- `Tests: 1 skipped, 70 passed, 71 total`
- `nest build` exit 0

**Golden case поведение (attempt #91 turn 6):**

- AI response симулирует pre-fix evaluator (bad overlap caps на non-target)
- С `evaluationMode: target_refusal`, `evidenceSource: meta_turn`, prior states frozen:
  - `fiber_definition` covered 1.0 (не 0)
  - `stack_vs_fiber` covered 1.0 (не 0.55)
  - `render_phase` partial 0.75 (не 0)
  - `fiber_pointers` capped ≤ 0.55 (refusal)

**Policy regression:** `follow-up-policy.target-refusal.spec.ts` уже содержит attempt #91 turn 6 (14.35) — дополнений не потребовалось.

**Replay script:** не запускался (не блокер).

## Changed files

- `backend/src/modules/adaptive-interview/calibration/golden-cases/react-fiber-attempt91-decline-scoped.json` (new)
- `backend/src/modules/adaptive-interview/calibration/golden-calibration.spec.ts`
- `docs/evaluation-accuracy/README.md` (§16 GUARD-02, DECL-01, SCORE-01 → fixed)
- `docs/evaluation-accuracy/candidate-turn-classifier.md` (§14 wave 4 complete)
- `docs/tasks/list/14-✅-evaluation-accuracy-analytics/TASKS.md`
- `docs/tasks/STATUS.md`
