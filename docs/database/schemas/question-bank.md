# Question Bank Schema

**Source of truth** продукта — AI не придумывает checkpoints; все критерии и веса в БД.

**Domain:** question-bank · **Migration:** `005_create_question_bank.sql` · **Feature block:** `05-⬜-question-bank`

---

## Принцип source of truth

```txt
Question bank → checkpoints + weights → interview snapshot → AI evaluation
```

AI сравнивает ответ только с checkpoints из **snapshot**, не из live question bank.

---

## Global vs company questions

| `company_id` | Policy |
|--------------|--------|
| `NULL` | Platform-global question (seed / admin) |
| `NOT NULL` | Company-specific custom question |

Query filter: `WHERE (company_id IS NULL OR company_id = ?) AND deleted_at IS NULL AND is_active = 1`

---

## ER diagram

```mermaid
erDiagram
  professions ||--o{ questions : categorizes
  topics ||--o{ questions : groups
  skills ||--o{ topics : contains
  questions ||--o{ question_skills : tagged
  skills ||--o{ question_skills : tagged
  questions ||--o{ question_checkpoints : has
  questions ||--o{ answer_examples : has
  companies ||--o{ questions : owns_optional

  questions {
    bigint id PK
    bigint company_id FK_nullable
    text question_text
    text short_answer
    text ideal_answer
    decimal max_score
    enum level
    enum difficulty
  }

  question_checkpoints {
    bigint id PK
    varchar checkpoint_key UK_per_question
    decimal score
  }
```

---

## Таблицы

### `professions` · `skills` · `topics`

Lookup tables. `topics.skill_id` optional FK → `skills`.

| professions | skills | topics |
|-------------|--------|--------|
| `code` UNIQUE | `code` UNIQUE | `code` UNIQUE |
| `name` | `name` | `name`, `skill_id`, `interview_weight` DECIMAL(4,2) DEFAULT 1 |

`interview_weight` — важность темы в итоговой оценке интервью (1–10). Снапшот → `interview_questions.topic_weight`. См. `docs/scoring/interview-weighted-score.md`.

### `questions`

Ideal answers хранятся **в самой таблице** (`short_answer`, `ideal_answer`), отдельная `ideal_answers` не нужна.

| Column | Type | Notes |
|--------|------|-------|
| `company_id` | BIGINT NULL | NULL = global |
| `profession_id` | BIGINT NOT NULL | FK |
| `topic_id` | BIGINT NOT NULL | FK |
| `level` | ENUM junior/middle/senior/lead | |
| `difficulty` | ENUM basic/intermediate/advanced | |
| `question_text` | TEXT | |
| `short_answer` | TEXT | Brief ideal |
| `ideal_answer` | TEXT | Full ideal |
| `max_score` | DECIMAL(5,2) | Sum of checkpoint scores |
| `deleted_at` | TIMESTAMP NULL | Soft delete for question bank |

**Indexes:** `(profession_id, level, difficulty)`, `(topic_id)`, `(company_id)`

### `question_skills` — M2M

Many questions ↔ many skills (React + JavaScript).

### `question_checkpoints`

Weight = колонка `score` (отдельная `checkpoint_weights` не нужна).

| Column | Notes |
|--------|-------|
| `checkpoint_key` | UNIQUE per `question_id` |
| `title`, `expected` | Criterion text |
| `evaluation_hints` | JSON: `mustConcepts`, `falseClaims`, `complexityTier`, `weightRationale` — см. [checkpoint-weight-rubric](../../question-bank/checkpoint-weight-rubric.md) |
| `score` | Weight toward max_score |
| `sort_order` | Display order |

**Rule:** `SUM(score) = questions.max_score` — enforced in application on save.

### `answer_examples`

| Column | Notes |
|--------|-------|
| `example_type` | ENUM `good` \| `bad` |
| `checkpoint_key` | NULL = question-level; set = per-checkpoint example |
| `example_text` | TEXT |

---

## Пример: useEffect (из PROJECT.md)

```json
{
  "question_text": "Что такое useEffect в React?",
  "max_score": 5,
  "checkpoints": [
    {"key": "side_effects", "score": 1},
    {"key": "dependency_array", "score": 1},
    {"key": "run_timing", "score": 1},
    {"key": "cleanup", "score": 1},
    {"key": "example", "score": 1}
  ]
}
```

---

## Snapshot policy (→ interview-core)

При создании interview:

1. Copy `questions` → `interview_questions`
2. Copy `question_checkpoints` (+ `evaluation_hints`) → `interview_question_checkpoints`
3. Copy `answer_examples` → `interview_answer_examples`
4. Snapshot immutable — изменения в question bank не влияют на активные интервью

---

## DDL reference

Deployed in `backend/migrations/005_create_question_bank.sql`.

---

## Related

- [`interview-core.md`](interview-core.md) — snapshot tables
- [`ai-evaluation.md`](ai-evaluation.md) — checkpoint_results keys must match snapshot
