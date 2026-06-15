# ✅ TASK-07.9 — Guardrails против AI-галлюцинаций

Status: [x] done

## Completion Notes

**Сделано:**

- `HallucinationGuardService` — unknown keys, missing evidence, quote-not-in-answer (fuzzy match).
- `guardrail-rules.ts` + prompt guardrails в final evaluation.
- Violations → `needs_manual_review` + audit в `raw_response.guardrailViolations`.
- Unit tests: synthetic hallucination payload.

**Проверки:** `npm run test -- hallucination-guard` · OK
