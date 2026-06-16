# TASKS — 14 evaluation-accuracy-analytics

Полный контекст: [`docs/evaluation-accuracy/README.md`](../../../evaluation-accuracy/README.md)

---

## Subtasks

| ID | Status | Title | File |
|----|--------|-------|------|
| TASK-14.1 | [ ] todo | Coverage vs accuracy taxonomy (понимает/знает/слышал/упомянул) | `001-⬜-coverage-accuracy-taxonomy.md` |
| TASK-14.2 | [ ] todo | Golden calibration dataset + CI | `002-⬜-golden-calibration-dataset.md` |
| TASK-14.3 | [ ] todo | LLM follow-ups, убрать rubric template fallback | `003-⬜-eliminate-template-fallback-followups.md` |
| TASK-14.4 | [ ] todo | Follow-up early stop policy | `004-⬜-follow-up-early-stop-policy.md` |
| TASK-14.5 | [ ] todo | False claim penalty hardening | `005-⬜-false-claim-penalty-hardening.md` |
| TASK-14.6 | [ ] todo | Per-checkpoint HR report (dashboard) | `006-⬜-checkpoint-hr-report-ui.md` |
| TASK-14.7 | [ ] todo | Coverage vs accuracy dual axis UI | `007-⬜-coverage-accuracy-dual-axis.md` |
| TASK-14.8 | [ ] todo | Ideal answer comparison в отчёте | `008-⬜-ideal-answer-comparison.md` |
| TASK-14.9 | [ ] todo | Red flags / misconceptions block | `009-⬜-red-flags-misconceptions.md` |
| TASK-14.10 | [ ] todo | Confidence + manual review в UI | `010-⬜-confidence-manual-review-ui.md` |
| TASK-14.11 | [ ] todo | Evaluator vs guard divergence logging | `011-⬜-evaluator-guard-divergence-logging.md` |
| TASK-14.12 | [ ] todo | A/B prompt versioning | `012-⬜-ab-prompt-versioning.md` |
| TASK-14.13 | [ ] todo | Verify topic_opener not scored | `013-⬜-topic-opener-not-scored.md` |
| TASK-14.14 | [ ] todo | Follow-up answer weight < main answer | `014-⬜-follow-up-weight-vs-main.md` |

---

## Recommended order

```txt
14.1 → 14.3 → 14.2 → 14.6 + 14.7 → 14.5 → 14.4 → остальные
```

---

## Baseline (done outside block)

- [x] Evaluator v2.4.0 half-right/half-wrong rubric (commit f93b32b)
- [x] Fiber-specific score guards (commit f93b32b)
- [x] Topic opener flow (commit f93b32b)
- [x] Follow-up acknowledgment variety (commit f93b32b)

---

## Block completion criteria

- [ ] Fiber 50/50 golden test: final score 4.5–5.5/10 (±1)
- [ ] Follow-up fallback rate < 5%, no rubric leak in candidate-visible text
- [ ] Dashboard: per-checkpoint report с rationale, red flags, confidence
- [ ] Документация обновлена в `docs/evaluation-accuracy/README.md`
