# Adaptive AI Interview Schema

**Domain:** adaptive-ai-interview · **Migration:** `013_create_adaptive_ai_interview.sql` · **Feature block:** `09-🟡-adaptive-ai-interview`

---

## Product Goal

Текущий text interview задаёт заранее выбранные вопросы и переходит дальше после ответа кандидата. Новый flow должен сделать интервью адаптивным:

```txt
Основной вопрос
→ ответ кандидата
→ AI оценивает только checkpoints этого вопроса
→ backend решает, нужен ли follow-up
→ AI формулирует follow-up строго по missing/unclear checkpoint
→ кандидат отвечает
→ checkpoint evidence обновляется
→ после лимитов или достаточного evidence переходим дальше
```

AI не становится источником критериев. Источник правды остаётся:

```txt
interview_question_checkpoints snapshot
```

Live question bank не должен влиять на уже созданные interviews.

---

## Token-Saving Principle

Нельзя отправлять AI весь transcript интервью на каждый ответ.

Каждый AI call получает только маленький context packet:

- `interview_question` текущего основного вопроса;
- snapshot checkpoints текущего вопроса;
- текущий ответ кандидата;
- compact checkpoint state по этому вопросу;
- короткие evidence snippets по уже закрытым/частичным checkpoints;
- последние 1-3 turns только внутри текущего вопроса, если нужно;
- лимиты follow-up и уже использованные attempts.

Final evaluation должна использовать агрегированные per-question summaries/evidence, а не полный transcript, кроме случаев manual review.

---

## Entities

### `interview_checkpoint_states`

Хранит текущее состояние каждого checkpoint внутри конкретного `interview_question` и `attempt`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `company_id` | BIGINT NOT NULL | tenant scope |
| `interview_attempt_id` | BIGINT NOT NULL | FK |
| `interview_question_id` | BIGINT NOT NULL | FK to snapshot question |
| `checkpoint_key` | VARCHAR(64) NOT NULL | must exist in `interview_question_checkpoints` |
| `status` | ENUM | `unseen`, `covered`, `partial`, `missed`, `unclear`, `skipped` |
| `score_awarded` | DECIMAL(5,2) NOT NULL DEFAULT 0 | current score |
| `max_score` | DECIMAL(5,2) NOT NULL | copied from snapshot checkpoint |
| `confidence` | DECIMAL(5,4) NULL | AI confidence 0..1 |
| `evidence_summary` | TEXT NULL | short token-saving summary |
| `evidence_message_ids` | JSON NULL | candidate/follow-up message ids |
| `rationale` | TEXT NULL | short explanation for report/debug |
| `follow_up_count` | INT UNSIGNED NOT NULL DEFAULT 0 | attempts used for this checkpoint |
| `needs_manual_review` | TINYINT(1) NOT NULL DEFAULT 0 | guardrail/fallback |
| `created_at` / `updated_at` | TIMESTAMP | |

Constraints/indexes:

- unique `(interview_attempt_id, interview_question_id, checkpoint_key)`;
- index `(company_id, interview_attempt_id)`;
- index `(interview_question_id, status)`;
- FK to `interview_attempts`;
- FK to `interview_questions`.

### `interview_follow_ups`

Хранит каждое уточнение, которое система решила задать.

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `company_id` | BIGINT NOT NULL | tenant scope |
| `interview_attempt_id` | BIGINT NOT NULL | |
| `interview_question_id` | BIGINT NOT NULL | main question |
| `checkpoint_key` | VARCHAR(64) NOT NULL | target checkpoint |
| `follow_up_question_message_id` | BIGINT NULL | `interview_messages.id` for AI question |
| `candidate_answer_message_id` | BIGINT NULL | candidate response to follow-up |
| `question_text` | TEXT NOT NULL | generated follow-up |
| `reason` | TEXT NOT NULL | why this checkpoint needs clarification |
| `status` | ENUM | `planned`, `asked`, `answered`, `skipped`, `failed` |
| `sort_order` | INT UNSIGNED NOT NULL | order inside current main question |
| `created_at` / `updated_at` | TIMESTAMP | |

Constraints/indexes:

- index `(interview_attempt_id, interview_question_id, sort_order)`;
- index `(interview_attempt_id, checkpoint_key)`;
- FK to `interview_messages` for question/answer ids with `ON DELETE SET NULL`.

### `interview_question_summaries`

Компактный итог по основному вопросу после всех follow-ups.

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `company_id` | BIGINT NOT NULL | |
| `interview_attempt_id` | BIGINT NOT NULL | |
| `interview_question_id` | BIGINT NOT NULL | unique per attempt/question |
| `score` | DECIMAL(5,2) NOT NULL | sum of checkpoint states |
| `max_score` | DECIMAL(5,2) NOT NULL | question max score |
| `summary` | TEXT NOT NULL | short result |
| `strengths` | JSON NULL | compact list |
| `weaknesses` | JSON NULL | compact list |
| `unclear_checkpoints` | JSON NULL | checkpoint keys |
| `follow_up_count` | INT UNSIGNED NOT NULL DEFAULT 0 | |
| `needs_manual_review` | TINYINT(1) NOT NULL DEFAULT 0 | |
| `created_at` / `updated_at` | TIMESTAMP | |

This table becomes the primary input for final evaluation.

### `interview_realtime_events` (optional outbox)

Для MVP socket events можно эмитить после DB commit без отдельной таблицы. Если нужна гарантированная доставка/аудит realtime событий, добавить lightweight outbox.

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | monotonic event id |
| `company_id` | BIGINT NOT NULL | |
| `interview_attempt_id` | BIGINT NOT NULL | |
| `interview_question_id` | BIGINT NULL | |
| `event_type` | VARCHAR(64) NOT NULL | e.g. `ai.follow_up_planned` |
| `payload` | JSON NOT NULL | public-safe event payload |
| `sequence_order` | BIGINT UNSIGNED NOT NULL | for client ordering |
| `created_at` | TIMESTAMP | |

Use this table only if implementation needs replay beyond GraphQL snapshot resync. Do not make socket delivery the source of truth.

---

## Realtime Transport

Frontend UX should be realtime, but business state must stay in MySQL.

Recommended split:

```txt
GraphQL mutation/query = commands and snapshots
WebSocket = realtime UI events
MySQL = source of truth
```

### Transport (MVP)

- NestJS `@nestjs/websockets` + Socket.IO adapter;
- namespace `/interview`;
- room `attempt:{attemptId}`;
- CORS aligned with frontend origin.

GraphQL subscriptions — out of scope for MVP (subtask `09.9`).

### Socket rooms

Candidate joins:

```txt
attempt:{attemptId}
```

Server validates:

- `publicToken` belongs to published interview;
- `attemptId` belongs to that interview/token;
- attempt is not archived/deleted.

### Event types

Public-safe events:

- `answer.received`;
- `ai.evaluation_started`;
- `ai.follow_up_planned`;
- `message.appended`;
- `question.completed`;
- `attempt.completed`;
- `evaluation.ready`;
- `adaptive.error_recovered`.

Events must not expose:

- `ideal_answer`;
- hidden checkpoint expected text;
- internal score/rationale before report;
- provider raw response;
- secrets or company-only analytics.

### Emit rule

Emit socket events only after DB commit. If transaction fails, no event.

Each event should include:

- `eventId` if available;
- `attemptId`;
- `interviewQuestionId` nullable;
- `messageId` / `followUpId` when relevant;
- `sequenceOrder`;
- `eventType`;
- minimal public payload.

### Reconnect/resync

WebSocket is not durable state. On reconnect or page refresh:

1. client reconnects and joins room;
2. client calls GraphQL `interviewSession(publicToken, attemptId)`;
3. UI rebuilds from DB snapshot;
4. socket events only apply incremental updates after that.

Client must dedupe events by `messageId`, `followUpId`, or `eventId`.

---

## Integration With Existing AI Evaluation

Adaptive flow **дополняет**, а не заменяет схему `07-ai-evaluation`. Разделение ответственности:

| Phase | Primary tables | Notes |
|-------|----------------|-------|
| Live interview (per answer) | `interview_checkpoint_states`, `interview_follow_ups` | Per-turn evaluator обновляет evidence |
| Main question complete | `interview_question_summaries` | Агрегат по snapshot question |
| Attempt complete | `final_evaluations`, optional sync to `question_evaluations` / `checkpoint_results` | Final eval читает summaries/states; legacy report types остаются совместимыми |

Правила:

- Live оценка **никогда** не читает live question bank — только `interview_question_checkpoints`.
- `question_evaluations` на attempt completion **не** должны повторно гонять full-transcript AI eval, если summaries/states уже есть.
- Для dashboard/report совместимости backend может **синхронизировать** `checkpoint_results` из `interview_checkpoint_states` без нового AI call (subtask `09.11`).
- `ai_usage_logs.operation_type` расширяется: `evaluate_turn`, `plan_follow_up`, `summarize_question` (плюс существующие `evaluate_answer`, `final_summary`).

---

## Feature Flag And Env Defaults

MVP включается флагом (default `false` до готовности frontend):

```txt
ADAPTIVE_INTERVIEW_ENABLED=false
ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION=3
ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT=1
ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO=0.6
ADAPTIVE_LOW_WEIGHT_CHECKPOINT_RATIO=0.2
ADAPTIVE_EVALUATOR_TIMEOUT_MS=15000
ADAPTIVE_PLANNER_TIMEOUT_MS=10000
ADAPTIVE_LOCAL_TURN_LIMIT=3
```

Когда `ADAPTIVE_INTERVIEW_ENABLED=false`, public submit flow сохраняет текущее questionnaire-поведение (subtask `09.8`).

---

## Question Flow State Machine

```txt
[main question shown]
  → candidate main_answer
  → per-turn evaluate
  → policy: follow-up?
       yes → plan follow-up → follow_up_question → candidate follow_up_answer → evaluate → policy again
       no  → write interview_question_summary → next main question OR attempt.completed
```

После каждого ответа (main или follow-up) backend выполняет **один** цикл: evaluate → policy → follow-up **или** complete question.

### When To Complete Main Question (no more follow-ups)

Переход к следующему main question, если **любое** из условий:

1. Нет eligible checkpoints для follow-up (все `covered`, или `partial` с достаточным score, или `skipped`).
2. Исчерпан лимит follow-ups на question (`ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION`).
3. Суммарный `score` по checkpoint states ≥ `max_score * ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO` и оставшиеся gaps — только low-weight checkpoints (см. ниже).
4. Evaluator/planner fallback: timeout или invalid JSON после repair → mark `needs_manual_review`, **не блокировать** переход дальше.

### Follow-Up Eligibility And Priority

Eligible checkpoint, если одновременно:

- `status` ∈ `missed`, `unclear`, `partial` (и score < checkpoint max);
- `follow_up_count` < `ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT`;
- общий follow-up count по question < `ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION`;
- checkpoint не low-priority skip: если `checkpoint.score / question.max_score < ADAPTIVE_LOW_WEIGHT_CHECKPOINT_RATIO` **и** question score уже ≥ sufficient ratio — skip.

Priority (backend выбирает eligible list, AI формулирует текст только по выбранному ключу):

1. Higher `checkpoint.score` (weight) first;
2. `unclear` before `missed` при равном weight;
3. Lower `sort_order` from snapshot.

Backend передаёт planner **один** `checkpointKey` (или список из одного элемента). AI не выбирает checkpoint свободно.

---

## Adaptive Policy

Default limits (overridable via env, см. выше):

- max `3` follow-ups per main question;
- max `1` follow-up per checkpoint;
- no follow-up if checkpoint weight is low and question score is already sufficient;
- no follow-up after provider timeout unless configured;
- if AI response invalid after repair, mark checkpoint/question `needs_manual_review` and continue.

Recommended statuses:

```txt
unseen   — checkpoint has not been evaluated yet
covered  — answer clearly covers checkpoint
partial  — answer partially covers checkpoint
missed   — answer does not cover checkpoint
unclear  — answer is ambiguous; one follow-up may be useful
skipped  — not asked because limits/time policy stopped it
```

### Fallback Matrix

| Failure | Checkpoint/question effect | Candidate UX | Continue interview? |
|---------|---------------------------|--------------|---------------------|
| Evaluator timeout | states → `unclear` or unchanged; `needs_manual_review=1` | `adaptive.error_recovered` event; mutation returns next step | yes |
| Evaluator invalid JSON after repair | `needs_manual_review=1` | same | yes — policy skips follow-up |
| Unknown checkpoint key in AI output | reject response; `needs_manual_review=1` | same | yes |
| Planner timeout | follow-up skipped; optional template from `checkpoint.title` | may show template follow-up or skip | yes |
| Planner invalid JSON | template fallback or skip | short generic clarification | yes |
| DB write after AI success | log error; no socket event | GraphQL error or safe retry | retry idempotent submit |

Кандидат **никогда** не видит provider errors, ideal answer или internal rationale.

---

## Message Model Extension (MVP Decision)

**MVP:** добавить колонки в `interview_messages` (migration `013`), не отдельную metadata table.

| Column | Type | Notes |
|--------|------|-------|
| `message_kind` | ENUM | `main_question`, `main_answer`, `follow_up_question`, `follow_up_answer`, `system_note` |
| `parent_message_id` | BIGINT NULL | FK → `interview_messages.id`, follow-up answer → follow-up question |
| `target_checkpoint_key` | VARCHAR(64) NULL | для follow-up messages |

Existing rows: `message_kind` NULL → treat as legacy (`main_question` / `main_answer` inferred from role + order).

---

## GraphQL Contract (Public Candidate)

Commands остаются GraphQL; realtime — WebSocket events (см. Realtime Transport).

### `submitInterviewAnswer` response extensions

Добавить к `SubmitInterviewAnswerPayload`:

| Field | Type | Notes |
|-------|------|-------|
| `pendingMessageText` | String nullable | follow-up или next main question text (rename/clarify `nextQuestionText`) |
| `messageKind` | Enum nullable | `main_question`, `follow_up_question`, null when completed |
| `currentInterviewQuestionId` | ID | active main question |
| `isFollowUp` | Boolean | true если pending message — follow-up |
| `answeredMainQuestions` | Int | только main questions, без follow-ups |
| `totalMainQuestions` | Int | unchanged semantics |
| `currentQuestionFollowUpCount` | Int | follow-ups уже заданные в текущем main question |

`status` остаётся `AttemptStatus` (`in_progress` | `completed`).

### `interviewSession` snapshot

Должен позволять полный rebuild после refresh:

- messages с `messageKind`, `sequenceOrder`, `role`, `content`, `interviewQuestionId`, `targetCheckpointKey`;
- `currentInterviewQuestionId`;
- `answeredMainQuestions` / `totalMainQuestions`;
- active pending AI message if any;
- **не** отдавать кандидату ideal answer, expected checkpoint text, scores.

---

## AI Calls

### Per-turn evaluator

Input (compact context packet):

- current question snapshot;
- checkpoint list for current question;
- candidate latest answer;
- compact state/evidence for this question;
- local turns (max `ADAPTIVE_LOCAL_TURN_LIMIT` pairs) for same `interview_question_id` only.

Output JSON contract:

```json
{
  "checkpointResults": [
    {
      "checkpointKey": "dependency_array",
      "status": "missed",
      "scoreAwarded": 0,
      "confidence": 0.92,
      "evidenceSummary": "No mention of dependency array.",
      "rationale": "Candidate described timing but not dependencies."
    }
  ]
}
```

Validation:

- `checkpointKey` MUST exist in snapshot;
- `status` ∈ `covered` | `partial` | `missed` | `unclear`;
- `0 <= scoreAwarded <= snapshot checkpoint score`;
- `0 <= confidence <= 1`;
- strings bounded (e.g. 500 chars) for token safety.

Maps to `interview_checkpoint_states` columns on upsert.

### Follow-up planner

Input:

- question text (no ideal answer in prompt if avoidable);
- **single** `targetCheckpointKey` chosen by backend policy;
- checkpoint `title` + short `expected` (for wording only);
- latest candidate answer;
- previous follow-up texts for this question (short list).

Output JSON contract:

```json
{
  "followUpQuestion": "Can you explain what the dependency array controls in useEffect?",
  "reason": "Checkpoint dependency_array is still missed."
}
```

Backend sets `shouldAskFollowUp` from policy **before** calling planner. Planner only generates `followUpQuestion` + `reason`. Validator rejects unknown keys (planner does not return checkpoint list).

Template fallback when planner fails:

```txt
Could you elaborate on: {checkpoint.title}?
```

Must not paste full `expected` or ideal answer.

### Question summary (on main question complete)

Compact JSON for `interview_question_summaries` (may be rule-based without AI in MVP, or one small AI call):

```json
{
  "summary": "Partial understanding of useEffect; missed cleanup and examples.",
  "strengths": ["side_effects", "run_timing"],
  "weaknesses": ["cleanup", "example"],
  "unclearCheckpoints": []
}
```

`score` / `max_score` — deterministic sum from `interview_checkpoint_states`, not from AI.

---

## Final Evaluation

Final evaluation should use:

- `interview_question_summaries`;
- `interview_checkpoint_states`;
- AI usage/cost logs;
- transcript only as optional fallback/manual review context.

It should not re-send the full conversation by default.

---

## Verification Requirements

Implementation must prove:

- migration creates tables and indexes;
- seed/sample interview can initialize checkpoint states;
- one main answer can produce one follow-up;
- repeated follow-up on same checkpoint is blocked by policy;
- provider timeout does not block completing interview;
- final evaluation can run using summaries/evidence;
- token payload size stays bounded by current question context, not full transcript.
