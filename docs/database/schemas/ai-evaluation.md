# AI Evaluation Schema

AI сравнивает ответ с checkpoint snapshot, возвращает structured JSON + normalized rows.

**Migration:** `007_create_ai_evaluation.sql` (+ `023_final_evaluation_achieved_level.sql`) · **Feature block:** `07-⬜-ai-evaluation`

---

## Design principle

```txt
AI НЕ придумывает новые criteria — checkpoint_key MUST exist in interview_question_checkpoints
```

Application guardrail: reject AI output with unknown keys.

---

## ER diagram

```mermaid
erDiagram
  interview_attempts ||--o| final_evaluations : has
  interview_attempts ||--o{ question_evaluations : has
  interview_messages ||--|| question_evaluations : evaluated_by
  question_evaluations ||--o{ checkpoint_results : contains
  companies ||--o{ ai_usage_logs : costs

  checkpoint_results {
    varchar checkpoint_key
    tinyint matched
    decimal score_awarded
  }
```

---

## `question_evaluations`

One evaluation per candidate **main answer** message (UNIQUE on `interview_message_id`).

| Column | Notes |
|--------|-------|
| `score`, `max_score` | DECIMAL(5,2) |
| `raw_response` | JSON — full AI payload |
| `short_summary`, `review` | Parsed text |
| `needs_manual_review` | Guardrail flag |

**Status: ACTIVE (not deprecated).** Это канонический per-question store, который читают `final_evaluations` (через `findByAttemptId`) и GraphQL-резолверы (`questionEvaluations`). Заполняется при запуске полной AI-оценки завершённой попытки (`AiEvaluationService.evaluateInterviewAttempt`):

- **Adaptive flow (основной):** `AdaptiveEvidenceEvaluationService.syncQuestionEvaluationsFromEvidence` синхронизирует одну строку на main-answer из `interview_question_summaries` — `score`/`max_score`/`short_summary` ЗЕРКАЛЯТ агрегат evidence (`buildQuestionSummaryFromCheckpointStates`). Поэтому исправления формата покрытия (TASK-17.3/17.4) автоматически попадают в `short_summary` новых попыток.
- **Legacy/non-adaptive flow:** прямой `upsertByInterviewMessage` из `AiEvaluationService`.

> Таблица не пустая и не «мёртвый путь»: строки появляются только для **завершённых и оценённых** попыток (по одной на вопрос). Незавершённые/preview-попытки имеют только `interview_checkpoint_states`, но не `question_evaluations`.

---

## `checkpoint_results`

| Column | Notes |
|--------|-------|
| `checkpoint_key` | Must match snapshot |
| `matched` | TINYINT(1) |
| `score_awarded` | DECIMAL(5,2) |
| `evidence_quote` | Quote from transcript |

UNIQUE `(question_evaluation_id, checkpoint_key)`

---

## `final_evaluations`

One per attempt (UNIQUE `interview_attempt_id`).

| Column | Notes |
|--------|-------|
| `total_score` | DECIMAL(5,2), scale 0–10 |
| `category` | weak \| basic \| average \| good \| strong |
| `hire_recommendation` | strong_reject … strong_invite |
| `achieved_level` | ENUM junior \| middle \| senior \| lead, NULL. «Demonstrated level» — высший уровень вопросов, реально подтверждённый кандидатом, **независимо** от целевого уровня интервью (block 18). NULL, если уровень не подтверждён. |
| `achieved_level_method` | ENUM evidence \| estimate, NULL. `evidence` — уровень напрямую проверен вопросами; `estimate` — грубая оценка (нижний уровень не покрыт). |
| `summary`, `detailed_summary` | TEXT |
| `strengths`, `weaknesses`, `risks` | JSON arrays |
| `raw_response` | JSON audit |

Index `idx_final_evaluations_company_achieved (company_id, achieved_level)` поддерживает talent pool (подбор прошлых кандидатов с `achievedLevel >= target` в рамках компании). Колонки добавлены миграцией `023_final_evaluation_achieved_level.sql`.

---

## `ai_usage_logs`

Cost tracking for analytics block 08.

| Column | Notes |
|--------|-------|
| `provider`, `model` | e.g. openai, gpt-4o |
| `operation_type` | evaluate_answer, final_summary, … |
| `prompt_tokens`, `completion_tokens` | INT |
| `cost_usd` | DECIMAL(12,6) |
| `company_id` | Tenant rollup |

---

## JSON → rows example

AI returns:

```json
{
  "score": 3,
  "maxScore": 5,
  "matchedCheckpoints": ["side_effects", "dependency_array", "run_timing"],
  "missedCheckpoints": ["cleanup", "example"]
}
```

Maps to:

- `question_evaluations.score = 3`
- `checkpoint_results` rows for each snapshot key with `matched=1/0`

---

## DDL reference

- `backend/migrations/007_create_ai_evaluation.sql`
- `backend/migrations/023_final_evaluation_achieved_level.sql` — `achieved_level` + `achieved_level_method` на `final_evaluations` (block 18)

---

## Related

- [`interview-core.md`](interview-core.md) — messages, attempts
- [`analytics-cost.md`](analytics-cost.md) — cost rollups from `ai_usage_logs`
