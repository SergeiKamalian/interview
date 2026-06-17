# TASK-14.17 — Scoring accuracy, red flags & legacy sync

## Status

- [x] done

## Goal

Устранить системные ошибки оценки, выявленные на attempt #76 (кандидат «Тестинг», React Fiber):

1. **Занижение** сильных ответов (stack vs Fiber 0.25 при coverage=high)
2. **Ложные red flags** («карточка» fiber-узла как false claim)
3. **Неверная атрибуция цитат** (scheduling red flag с цитатой из lanes)
4. **Вводящий в заблуждение UI** (legacy `checkpoint_results` всегда 0.5 для partial)

Все доменные сигналы (keywords, metaphors, concept groups, false claims) — **только из БД** (`evaluation_hints` JSON в question bank → interview snapshot). Код — generic guards без topic hardcode.

## Root causes (confirmed in code)

| Symptom | Root cause |
|---------|------------|
| Занижение | Guards используют `latestCandidateAnswer`, не per-checkpoint evidence window; `applyRationaleScoreAlignment` не re-run после merge |
| Ложный red flag | `overlapsReferenceExamples` token overlap + label `depth=false_claim` для bad-example similarity |
| Неверная цитата | `attachFalseClaimEvidence` берёт первое предложение latest turn, не matched `falseClaims` phrase |
| UI 0.5 везде | `mapCheckpointStateToEvaluationResult` не передаёт `scoreAwarded`; `checkpoint-result.mapper` всегда `max × 0.5` для partial |

## Scope

### A. Extend `evaluation_hints` schema (JSON, без migration)

Новые optional поля в `CheckpointEvaluationHints`:

```typescript
neutralMetaphors?: string[]       // не триггерить bad-example overlap cap
requiredConceptGroups?: string[][] // partial floor пропорционально покрытым группам
```

Seed: `backend/seeds/fiber-evaluation-hints.seed.sql` — добавить для `fiber_pointers`, `scheduling`, и т.д.

### B. Per-checkpoint evidence window

- Расширить `AdaptiveLocalTurn`: `messageKind?`, `targetCheckpointKey?`
- `collectCheckpointEvidenceText(context, checkpointKey)`:
  - main_answer + все candidate turns где `targetCheckpointKey === checkpointKey`
  - fallback: full cumulative text
- Guards (`applyRationaleScoreAlignment`, `applyPositiveEvidenceFloor`, contradiction cap, bad-example overlap) используют checkpoint evidence, не только latest turn

### C. Separate bad-example similarity from semantic false claim

- `applyBadExampleOverlapCap` → rationale label `similarity=bad_example` (NOT `depth=false_claim`)
- Strip `neutralMetaphors` from text before overlap check (from bank hints)
- `checkpoint-red-flags.util.ts` → red flag **только** при:
  - `depth=false_claim` в rationale, OR
  - `matchesCheckpointFalseClaims(evidenceText, hints.falseClaims)`
- **Не** red flag для `similarity=bad_example` / `overlaps bad answer example`

### D. Quote attribution

- `extractMatchedFalseClaimQuote(text, falseClaims[])` — sentence containing matched false claim phrase
- `attachFalseClaimEvidence` — use checkpoint evidence text + `hints.falseClaims` from bank
- Red flags prefer `evidenceSummary` only when quote matches checkpoint's falseClaims

### E. Post-merge rationale alignment

После `mergeCheckpointEvaluation` — повторный `applyRationaleScoreAlignment` на merged score/rationale с `maxScore = priorState.maxScore ?? checkpoint.score`.

### F. Legacy checkpoint_results sync

- `CheckpointEvaluationResultItem.scoreAwarded?: number`
- `mapCheckpointStateToEvaluationResult` — pass `state.scoreAwarded`
- `mapCheckpointResultsForStorage` / `summarizeCheckpointResults` — use actual score when present; `matched` when `score >= max × 0.85`

### G. Golden calibration cases

- `react-fiber-stack-vs-fiber-strong.json` — strong paraphrase, score ≥ 0.65
- `react-fiber-pointers-paraphrase.json` — parent/child/neighbor without child/sibling/return names, no red flag, score ≥ 0.55
- `react-fiber-scheduling-priorities-not-false.json` — priorities answer must NOT red-flag scheduling

## Out of scope

- GraphQL admin UI для редактирования hints (block 05)
- Re-run attempt #76 автоматически
- Frontend удаление legacy panel (можно отдельным subtask)

## Verification

```bash
cd backend
pnpm test -- apply-checkpoint-score-floors checkpoint-evidence-text checkpoint-red-flags checkpoint-result.mapper golden-calibration
pnpm build
```

Manual: replay attempt 76 или новый Fiber attempt — adaptive scores = legacy checkpoint_results scores; red flags только на requestIdleCallback-class false claims.

## Completion Notes

**Команды (2026-06-17, закрытие subtask):**

```bash
cd backend
pnpm test -- apply-checkpoint-score-floors checkpoint-evidence-text checkpoint-red-flags checkpoint-result.mapper golden-calibration
# → 5 suites, 29 passed, 1 skipped

pnpm test
# → 51 suites, 164 passed, 1 skipped

pnpm build
# → OK
```

**Seed (ранее):** `docker compose exec mysql ... < backend/seeds/fiber-evaluation-hints.seed.sql` — neutralMetaphors, requiredConceptGroups, scheduling falseClaims.

**Реализовано:**

- `checkpoint-evidence-text.util.ts` — per-checkpoint evidence window (main + targeted follow-ups)
- `evaluation_hints`: `neutralMetaphors`, `requiredConceptGroups` (parser + Fiber seed)
- Guards: `similarity=bad_example` отделён от `depth=false_claim`; red flags только semantic false claims из bank
- `extractMatchedFalseClaimQuote` — цитата по matched `falseClaims`
- Post-merge `applyRationaleScoreAlignment`; floor по scoped evidence на targeted follow-up
- Legacy sync: `scoreAwarded` из `interview_checkpoint_states` → `checkpoint_results`
- 3 golden cases + обновлён attempt42-paraphrase band

**Manual smoke:** backend в момент закрытия не запущен; attempt #77 уже показывал улучшение (6.5, 0 red flags). Рекомендуется после деплоя: re-evaluate attempt 76 или новый Fiber attempt на dashboard — legacy panel = adaptive scores.

**Следующий subtask:** TASK-14.18 — Probe-or-Accept.
