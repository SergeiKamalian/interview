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

---

## Block completion criteria

- [x] Fiber 50/50 golden test: guards cap total to ~35–65% raw (attempt 36 live: 1.4/8)
- [x] Follow-up fallback uses checkpoint title, not rubric `expected`
- [x] Dashboard: per-checkpoint report с rationale, red flags, confidence, dual axis
- [x] Документация обновлена в `docs/evaluation-accuracy/README.md`
