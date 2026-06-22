# Company Question Bank Schema

**Company Knowledge Layer** — overlay поверх платформенного question bank. Компания добавляет свои темы, стеки, вопросы, red/green flags и playbooks; AI-оценка по-прежнему идёт только через **immutable snapshot**.

**Domain:** question-bank · **Depends on:** `005_create_question_bank.sql`, `006_create_interview_core.sql` · **Feature block:** `20-✅-company-question-bank`

---

## Принцип

```txt
Global bank (read-only для компании)
  + Company overlay (topics/skills/questions/overrides/playbooks)
  → selection with custom priority
  → snapshot merge (global + overrides OR company-owned OR fork)
  → AI evaluation (unchanged math: checkpoint weights → /10)
```

**Инварианты (не нарушать):**

- AI не придумывает checkpoints; компания задаёт их явно (CRUD / import / fork).
- `SUM(checkpoint.score) = questions.max_score = 10.00` на save/import.
- Global questions/topics/skills **не редактируются** компанией — только fork или override.
- Tenant isolation: company A не видит overlay company B.
- Snapshot immutable после создания интервью.

---

## ER diagram

```mermaid
erDiagram
  companies ||--o{ skills : owns_optional
  companies ||--o{ topics : owns_optional
  companies ||--o{ questions : owns
  companies ||--o{ company_question_overrides : defines
  companies ||--o{ company_question_playbooks : owns

  skills ||--o{ topics : groups
  topics ||--o{ questions : contains
  questions ||--o{ questions : forked_from
  questions ||--o{ company_question_overrides : overridden_by
  questions ||--o{ question_checkpoints : has
  questions ||--o{ answer_examples : has

  company_question_playbooks ||--o{ company_question_playbook_items : contains
  questions ||--o{ company_question_playbook_items : referenced

  skills {
    bigint id PK
    bigint company_id FK_nullable
    varchar code
    varchar name
  }

  topics {
    bigint id PK
    bigint company_id FK_nullable
    bigint skill_id FK
    varchar code
    decimal interview_weight
  }

  questions {
    bigint id PK
    bigint company_id FK_nullable
    bigint source_question_id FK_nullable
    enum status draft_published
    tinyint company_priority
    tinyint is_required
  }

  company_question_overrides {
    bigint id PK
    bigint company_id FK
    bigint source_question_id FK
    json extra_must_concepts
    json extra_false_claims
    json extra_answer_examples
    decimal topic_weight_override_nullable
  }

  company_question_playbooks {
    bigint id PK
    bigint company_id FK
    bigint profession_id FK
    enum level
    json skill_ids_nullable
  }
```

---

## Taxonomy overlay

### `professions`

Остаётся **global-only** (Frontend Developer, Backend Developer, …). Company questions привязываются к существующей profession.

### `skills` — extended

| Column | Type | Notes |
|--------|------|-------|
| `company_id` | BIGINT UNSIGNED NULL | NULL = platform-global |
| `code` | VARCHAR(64) | Unique per scope — see indexes |
| `name` | VARCHAR(255) | |
| `is_active` | TINYINT(1) | |

**Unique indexes (MySQL):**

- Global: unique on `code` where `company_id IS NULL` — implemented via composite `UNIQUE (company_id, code)` where global rows use sentinel or separate partial unique strategy (migration 027: drop `uq_skills_code`, add `UNIQUE KEY uq_skills_company_code (company_id, code)` — MySQL treats NULL company_id as distinct per row; global codes remain unique among NULL rows if enforced in app + seed discipline).

**Policy:** company skill codes SHOULD be prefixed in UI import (`acme_internal_api`) to avoid accidental collision with global codes in lookups.

### `topics` — extended

| Column | Type | Notes |
|--------|------|-------|
| `company_id` | BIGINT UNSIGNED NULL | NULL = platform-global |
| `skill_id` | BIGINT UNSIGNED NULL | FK → global or company skill |
| `code` | VARCHAR(128) | Extended length already in `018_extend_topic_code_length.sql` |
| `name` | VARCHAR(255) | |
| `interview_weight` | DECIMAL(4,2) DEFAULT 1 | 1–10, same as global |
| `is_active` | TINYINT(1) | |

**Visibility query:**

```sql
WHERE (t.company_id IS NULL OR t.company_id = ?) AND t.is_active = 1
```

Company topic may reference a global skill (e.g. custom topic under `react`) or company skill.

---

## Questions — extended metadata

New columns on `questions` (migration 027):

| Column | Type | Notes |
|--------|------|-------|
| `source_question_id` | BIGINT UNSIGNED NULL | FK → `questions(id)` ON DELETE SET NULL — fork lineage |
| `status` | ENUM `draft` \| `published` | Default `published` for existing rows; import default `draft` |
| `company_priority` | TINYINT UNSIGNED DEFAULT 0 | 0–10; boost in selection when ties |
| `is_required` | TINYINT(1) DEFAULT 0 | Pinned: always included in suggest when profession/level/skills match |

**Rules:**

- `is_required`, `company_priority`, `status=draft` — only when `company_id IS NOT NULL`.
- `source_question_id` set only on fork; NULL on original company question or override path.
- Suggest pool default: `status = published` AND visibility filter unchanged.
- Explicit `questionIds` in `createInterview` may include company `draft` if owned by tenant.

**Fork vs override vs owned:**

| Pattern | When | Snapshot source |
|---------|------|-----------------|
| **Owned** | New question from scratch | Full company question rows |
| **Fork** | Copy global, edit freely | Full forked question rows |
| **Override** | Tweak red/green on global | Global checkpoints + merged hints/examples |

### Fork replaces global in selection (TASK-20.13)

When company has a **published** fork (`source_question_id = global.id`):

- `suggestInterviewQuestions` / `findSuggestionCandidates` **exclude** the global row for that tenant
- `questionBank` list (default / scope=all) also excludes replaced global
- `scope=global` or `includeForkReplacedGlobal=true` still shows platform original (UI badge «Есть ваша версия»)
- **Draft** forks do **not** hide global until published

SQL (per tenant):

```sql
NOT (
  q.company_id IS NULL
  AND EXISTS (
    SELECT 1 FROM questions fq
    WHERE fq.company_id = ?
      AND fq.source_question_id = q.id
      AND fq.status = 'published'
      AND fq.deleted_at IS NULL AND fq.is_active = 1
  )
)
```

---

## `company_question_overrides`

Lightweight amendments without duplicating full question.

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `company_id` | BIGINT NOT NULL | FK → companies CASCADE |
| `source_question_id` | BIGINT NOT NULL | FK → questions; **must** be global (`company_id IS NULL`) |
| `extra_must_concepts` | JSON NULL | Array of strings — merged into each checkpoint's `mustConcepts` OR question-level merge policy below |
| `extra_false_claims` | JSON NULL | Array of strings — merged into hints |
| `extra_answer_examples` | JSON NULL | Array of `{ exampleType, exampleText, sortOrder, checkpointKey? }` |
| `topic_weight_override` | DECIMAL(4,2) NULL | Optional snapshot weight for this question's topic |
| `created_at`, `updated_at` | TIMESTAMP | |

**UNIQUE** `(company_id, source_question_id)`.

**Merge policy at snapshot (TASK-20.5):**

1. Load global question + checkpoints + examples.
2. If override exists for `(companyId, questionId)`:
   - For **each** checkpoint: `evaluation_hints.mustConcepts = dedupe(global.mustConcepts + extra_must_concepts)`; same for `falseClaims`.
   - Append `extra_answer_examples` after global examples (re-sort `sort_order`).
   - If `topic_weight_override` set → use for `interview_questions.topic_weight` instead of topic's `interview_weight`.
3. Insert snapshot rows — same shape as today.

Question-level only override (no per-checkpoint keys in v1): extras apply to **all** checkpoints' hint arrays equally. Per-checkpoint override deferred to v2.

---

## `company_question_playbooks` (TASK-20.12)

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `company_id` | BIGINT NOT NULL | |
| `name` | VARCHAR(255) | e.g. «Frontend Middle @ Acme» |
| `profession_id` | BIGINT NOT NULL | |
| `level` | ENUM junior/middle/senior/lead | |
| `skill_ids` | JSON NULL | Optional filter hint |
| `is_active` | TINYINT(1) | |

### `company_question_playbook_items`

| Column | Type | Notes |
|--------|------|-------|
| `playbook_id` | BIGINT FK | |
| `question_id` | BIGINT FK | Must be visible to company |
| `sort_order` | INT | |
| `is_pinned` | TINYINT(1) | Locked in apply |

**Apply:** pinned items first → AI/manual fill to target count.

Optional later: `interview_templates.playbook_id` FK (block 15 integration).

---

## Selection priority

Used in `findSuggestionCandidates`, fallback selection, and AI prompt context.

**SQL ORDER BY:**

```sql
ORDER BY
  q.is_required DESC,
  (q.company_id IS NOT NULL) DESC,
  q.company_priority DESC,
  t.interview_weight DESC,
  q.id ASC
```

**Suggest algorithm:**

1. **Required pass:** all `is_required=1` published company questions matching profession + level (+ skillIds if provided) → prepend to result (dedupe by id).
2. **Pool:** remaining slots filled from ordered candidates (AI or fallback).
3. **AI prompt** (`question-suggestion.prompt.ts`): add rule — when equally relevant, prefer candidates with `isCustom=true` and higher `companyPriority`.

**JD draft** (`job-description-draft.service.ts`): inherits same suggest service — no separate logic.

---

## Snapshot policy (extends interview-core)

Unchanged flow in `InterviewCoreService.createInterview`:

1. Resolve each `questionId` via visibility filter.
2. If global question + company override → **merge** then copy.
3. If company-owned or fork → copy as-is.
4. Copy to `interview_questions`, `interview_question_checkpoints`, `interview_answer_examples`.
5. Store `source_question_id` on `interview_questions` (already exists) — points to bank question id (global or company).

Active interviews **never** backfill overlay changes (same as global bank edits).

---

## Import contract

Internal DTO mirrors `BankTopicFile` (`backend/src/seed/bank-topic.types.ts`) grouped for bulk:

```typescript
type CompanyImportBundle = {
  topics: Array<{ code; name; skillCode; interviewWeight; isNewSkill?: boolean }>;
  questions: Array<BankTopicFile>; // one question per topic typically
};
```

### Excel flat format (v1)

One row = one checkpoint. Repeated columns for question/topic:

| Column | Required | Notes |
|--------|----------|-------|
| `topic_code` | yes | snake_case |
| `topic_name` | yes | |
| `skill_code` | yes | global or new company skill |
| `interview_weight` | no | default 5 |
| `profession_code` | yes | must exist globally |
| `level` | yes | junior/middle/senior/lead |
| `difficulty` | yes | basic/intermediate/advanced |
| `question_text` | yes | |
| `short_answer` | yes | |
| `ideal_answer` | yes | |
| `checkpoint_key` | yes | unique per question |
| `checkpoint_title` | yes | |
| `checkpoint_expected` | yes | |
| `checkpoint_weight` | yes | decimal; Σ per question = 10 |
| `must_concepts` | no | pipe-separated `\|` |
| `false_claims` | no | pipe-separated |
| `example_good` | no | question-level if no checkpoint_key on example cols |
| `example_bad` | no | |

### Validation

- Σ `checkpoint_weight` = 10.00 per grouped question (tolerance ±0.01).
- Enums strict.
- `topic_code` / `checkpoint_key` snake_case `[a-z0-9_]+`.
- All imported entities get `company_id = current tenant`.
- Default `status = draft` on import commit.
- Cannot import over global rows — only upsert company-owned topics/questions by `(company_id, code)`.

### Preview diff

`previewCompanyQuestionImport` returns:

```typescript
{
  toCreate: { topics, skills, questions, checkpoints },
  toUpdate: { topics, questions }, // match by company scope + code
  errors: { row, field, message }[],
  warnings: { row, message }[],
  importToken: string // short-lived cache for commit
}
```

---

## GraphQL surface (planned)

| Operation | Purpose |
|-----------|---------|
| `createCompanySkill` / `updateCompanySkill` | Taxonomy |
| `createCompanyTopic` / `updateCompanyTopic` | Taxonomy |
| `forkQuestion(sourceQuestionId)` | Copy global → company draft |
| `createQuestion` / `updateQuestion` | Extended with status, priority, isRequired |
| `upsertCompanyQuestionOverride` | Red/green extras |
| `previewCompanyQuestionImport` / `commitCompanyQuestionImport` | Bulk |
| `companyQuestionPlaybooks` / CRUD | Playbooks |

Types: `isCustom: Boolean!` on Question, Topic, Skill when `companyId != null`.

---

## Frontend UI (block 20 — shadcn)

Question Bank page upgrade to match dashboard patterns (Review Queue, Interview Details):

- **Layout:** page header + action bar (Создать, Импорт, Playbooks) + tabs `Все | Наши | Платформа`.
- **List:** shadcn `Table` or refined accordion with badges (`Custom`, `Draft`, `Required`, weight tier).
- **Detail:** `Sheet` or dedicated route for view/edit; checkpoint editor as sub-table with tag inputs for mustConcepts/falseClaims.
- **Fork:** action on platform question detail → opens editor pre-filled.
- **Overrides:** inline panel on global question — «Наши red/green flags».
- **Import:** Dialog wizard (upload → preview DataTable → commit).
- **Dark mode:** use semantic tokens (`text-foreground`, `bg-card`) — not hardcoded `slate-900` only.
- Components from `@shared/ui` only.

Reference pages: `ReviewQueuePage`, `AttemptReviewPage`, interview create wizard Step 2.

---

## Security

- All mutations scoped `@CurrentUser().companyId`.
- Cannot mutate rows where `company_id IS NULL` (except read).
- Override only on global source questions.
- Import file size cap (e.g. 5 MB), row cap (e.g. 500 checkpoints).
- `importToken` expires in 15 minutes, single commit.

---

## Migrations

| Migration | Content |
|-----------|---------|
| `027_company_question_bank_overlay.sql` | skills/topics company_id, questions metadata, overrides table |
| `028_conduct_moderation.sql` | conduct moderation (parallel work) |
| `029_company_question_playbooks.sql` | playbooks + items (TASK-20.12) |

---

## Related

- [`question-bank.md`](question-bank.md) — global bank
- [`interview-core.md`](interview-core.md) — snapshot tables
- [`../../question-bank/checkpoint-weight-rubric.md`](../../question-bank/checkpoint-weight-rubric.md)
- [`../../tasks/list/20-✅-company-question-bank/README.md`](../../tasks/list/20-✅-company-question-bank/README.md)
