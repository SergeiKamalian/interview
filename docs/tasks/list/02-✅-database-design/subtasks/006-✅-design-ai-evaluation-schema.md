# ⬜ TASK-02.6 — Спроектировать схему AI evaluation

Status: [ ] todo
Priority: High
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы для хранения AI-оценок: question_evaluations, checkpoint_results, final_evaluations, ai_usage_logs.

---

## Context

AI сравнивает ответ кандидата с checkpoints из snapshot, возвращает structured JSON. Схема должна хранить raw AI response, parsed results и audit trail.

---

## Scope

- Создать `docs/database/schemas/ai-evaluation.md`.
- Таблицы: `question_evaluations`, `checkpoint_results`, `final_evaluations`, `ai_usage_logs`.
- `checkpoint_results`: `checkpoint_key`, `matched` BOOL, `score_awarded`, `evidence_quote`.
- `final_evaluations`: `total_score`, `category`, `hire_recommendation`, `summary`.
- `ai_usage_logs`: `provider`, `model`, `prompt_tokens`, `completion_tokens`, `cost_usd`.
- FK к `interview_attempt_id`, `interview_message_id`.

---

## Out of Scope

- AI provider integration code (блок 07).
- Dashboard display (блок 08).

---

## Files / Folders Allowed

```txt
docs/database/schemas/ai-evaluation.md
```

---

## Requirements

1. Raw JSON column `raw_response JSON` + parsed normalized tables.
2. Checkpoint keys must match snapshot keys only (guardrail design note).
3. `final_evaluations.total_score` DECIMAL(4,2) scale 0-10.
4. `hire_recommendation` ENUM: `strong_reject`, `reject`, `maybe`, `invite`, `strong_invite`.
5. `ai_usage_logs` привязан к `company_id` для cost analytics.
6. Idempotency: one evaluation per message attempt (unique constraint).

---

## Step-by-step Plan

1. ER diagram evaluation domain.
2. DDL all tables.
3. Example JSON → row mapping for one question eval.
4. Document guardrail columns: `needs_manual_review`.
5. Cost logging fields for block 08 analytics.

---

## Acceptance Criteria

- Evaluation schema stores per-question and final results.
- AI usage logging schema ready.
- Checkpoint result structure matches PROJECT.md JSON example.
- No new criteria invented by AI — design note explicit.

---

## Checks

```bash
test -f docs/database/schemas/ai-evaluation.md
rg "checkpoint_results|ai_usage_logs|hire_recommendation" docs/database/schemas/ai-evaluation.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
