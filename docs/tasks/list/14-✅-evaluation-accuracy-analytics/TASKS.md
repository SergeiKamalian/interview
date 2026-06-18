# TASKS — 14 evaluation-accuracy-analytics

Полный контекст: [`docs/evaluation-accuracy/README.md`](../../../evaluation-accuracy/README.md)

---

## Subtasks

| ID | Status | Title | File |
|----|--------|-------|------|
| TASK-14.1 | [x] done | Coverage vs accuracy taxonomy (понимает/знает/слышал/упомянул) | `001-✅-coverage-accuracy-taxonomy.md` |
| TASK-14.2 | [x] done | Golden calibration dataset + CI | `002-✅-golden-calibration-dataset.md` |
| TASK-14.3 | [x] done | LLM follow-ups, убрать rubric template fallback | `003-✅-eliminate-template-fallback-followups.md` |
| TASK-14.4 | [x] done | Follow-up early stop policy | `004-✅-follow-up-early-stop-policy.md` |
| TASK-14.5 | [x] done | False claim penalty hardening | `005-✅-false-claim-penalty-hardening.md` |
| TASK-14.6 | [x] done | Per-checkpoint HR report (dashboard) | `006-✅-checkpoint-hr-report-ui.md` |
| TASK-14.7 | [x] done | Coverage vs accuracy dual axis UI | `007-✅-coverage-accuracy-dual-axis.md` |
| TASK-14.8 | [x] done | Ideal answer comparison в отчёте | `008-✅-ideal-answer-comparison.md` |
| TASK-14.9 | [x] done | Red flags / misconceptions block | `009-✅-red-flags-misconceptions.md` |
| TASK-14.10 | [x] done | Confidence + manual review в UI | `010-✅-confidence-manual-review-ui.md` |
| TASK-14.11 | [x] done | Evaluator vs guard divergence logging | `011-✅-evaluator-guard-divergence-logging.md` |
| TASK-14.12 | [x] done | A/B prompt versioning | `012-✅-ab-prompt-versioning.md` |
| TASK-14.13 | [x] done | Verify topic_opener not scored | `013-✅-topic-opener-not-scored.md` |
| TASK-14.14 | [x] done | Follow-up answer weight < main answer | `014-✅-follow-up-weight-vs-main.md` |
| TASK-14.15 | [x] done | Bank-driven guards (remove fiber hardcode) | `015-✅-bank-driven-guards.md` |
| TASK-14.16 | [x] done | DB checkpoint evaluation hints + snapshot | `016-✅-db-checkpoint-evaluation-hints.md` |
| TASK-14.17 | [x] done | Scoring accuracy, red flags & legacy sync | `017-✅-scoring-red-flags-evidence-sync.md` |
| TASK-14.18 | [x] done | Probe-or-Accept: не штрафовать без уточняющего | `018-✅-probe-or-accept-policy.md` |
| TASK-14.22 | [x] done | Residual gap probe (narrowing follow-up) | `022-✅-residual-gap-probe.md` |
| TASK-14.19 | [x] done | Weight-based follow-up budget allocator | `019-✅-weight-budget-follow-up-allocator.md` |
| TASK-14.20 | [x] done | Transitive checkpoint floors (сложный → простой) | `020-✅-transitive-checkpoint-floors.md` |
| TASK-14.21 | [x] done | Topic mismatch redirect (ответ не на тот checkpoint) | `021-✅-topic-mismatch-redirect.md` |
| TASK-14.23 | [x] done | UI: уверенность AI в оценке (clarity) | `023-✅-ai-evaluation-confidence-ui-clarity.md` |
| TASK-14.24 | [x] done | Probe missed structural checkpoints | `024-✅-probe-missed-structural-checkpoints.md` |
| TASK-14.25 | [x] done | Floors guard coverage=none | `025-✅-floors-guard-coverage-none.md` |
| TASK-14.26 | [x] done | Min probes before topic switch | `026-✅-min-probes-before-topic-switch.md` |
| TASK-14.27 | [x] done | Candidate clarification on vague follow-up | `027-✅-candidate-clarification-follow-up.md` |
| TASK-14.28 | [x] done | Candidate turn AI classifier (intent вместо regex) | `028-✅-candidate-turn-ai-classifier.md` |
| TASK-14.29 | [x] done | Wire classifier into submit + policy | `029-✅-wire-classifier-submit-policy.md` |
| TASK-14.30 | [ ] todo | Deprecate legacy intent regex | `030-⬜-deprecate-legacy-intent-regex.md` |
| TASK-14.31 | [ ] todo | Bank-driven false claims (legacy-contradiction-cap) | `031-⬜-bank-driven-false-claims.md` |

---

## Post-14 wave (Attempt 82)

```txt
14.23 UI confidence clarity        ✅
14.24 Probe missed structural CP   ✅
14.25 Floors guard coverage=none     ✅
14.26 Min probes before topic switch ✅
14.27 Candidate clarification follow-up  ✅
```

## Wave 3 — AI intent classifier (вместо regex)

Design: [`docs/evaluation-accuracy/candidate-turn-classifier.md`](../../../evaluation-accuracy/candidate-turn-classifier.md)

```txt
14.28 Candidate turn AI classifier     ✅
14.29 Wire classifier into submit      ✅
14.30 Deprecate legacy intent regex    ⬜  ← START HERE
14.30 Deprecate legacy intent regex    ⬜
14.31 Bank-driven false claims         ⬜
```

## Roadmap (adaptive probing — после 14.17)

```txt
14.18 Probe-or-Accept     → shallow accept + OpenAI prompts 2.6 (turn policy block)
14.22 Residual gap probe  → narrowing follow-up when compound answer is partial
14.19 Budget allocator    → weight × gap + budget block в turn prompt
14.20 Transitive floors   → bank impliesCheckpointFloors + hints в turn prompt
14.21 Topic mismatch      → useEffect vs useState redirect, не сразу 0
```

---

## Block completion criteria

- [x] Fiber 50/50 golden test: guards cap total to ~35–65% raw (attempt 36 live: 1.4/8)
- [x] Follow-up fallback uses checkpoint title, not rubric `expected`
- [x] Dashboard: per-checkpoint report с rationale, red flags, confidence, dual axis
- [x] Документация обновлена в `docs/evaluation-accuracy/README.md`
