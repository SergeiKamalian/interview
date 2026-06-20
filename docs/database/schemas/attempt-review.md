# Attempt Review State Schema

Company-side review progress per completed interview attempt: viewed or not, agree/disagree with AI assessment, hiring decision.

**Migrations:** `024_interview_attempt_review_state.sql`, `025_interview_attempt_review_notes.sql`, `026_interview_attempt_share_tokens.sql` · **Feature block:** `19-post-interview-company-flow` (TASK-19.10, TASK-19.15, TASK-19.16)

---

## Purpose

```txt
completed attempt → company opens review → in_review
                 → agree/disagree with AI → reviewed + ai_assessment_verdict
                 → shortlist / reject / invite_live → company_decision
```

AI `hire_recommendation` on `final_evaluations` is **not** overwritten — company verdict is a separate axis.

---

## Tables

### `interview_attempt_reviews`

One row per `(company_id, interview_attempt_id)`.

| Column | Type | Notes |
|--------|------|-------|
| `review_status` | `pending` \| `in_review` \| `reviewed` | View progress |
| `ai_assessment_verdict` | `pending` \| `agree` \| `disagree` | Company vs AI |
| `company_decision` | `pending` \| `shortlist` \| `reject` \| `invite_live` \| `hold` | Next hiring step |
| `ai_verdict_reason` | TEXT NULL | Optional note on disagree |
| `reviewed_at` | TIMESTAMP NULL | Set when verdict/decision finalized |
| `reviewed_by` | FK users NULL | Last actor |

**Default when no row:** all status fields = `pending`, timestamps null (application layer).

**Scope:** only `interview_attempts` with `status = completed`, `is_preview = 0`, matching `company_id`.

### `interview_attempt_review_notes`

Internal hiring-team notes on a completed attempt (plain text, visible to all company members).

| Column | Type | Notes |
|--------|------|-------|
| `body` | TEXT NOT NULL | Plain text / markdown-friendly, no @mentions in v1 |
| `created_by` | FK users NOT NULL | Author |
| `updated_by` | FK users NULL | Last editor (author-only updates in v1) |

**Scope:** `(company_id, interview_attempt_id)` — same tenant rules as `interview_attempt_reviews`.

**List order:** `created_at ASC` (conversation thread).

### `interview_attempt_review_events`

Audit trail (pattern: `candidate_shortlist_events`).

| action | When |
|--------|------|
| `review_started` | First open / mark in review |
| `ai_verdict_set` | agree / disagree |
| `company_decision_set` | shortlist, reject, invite_live, hold |

---

## GraphQL

### TASK-19.10

- Fields on `InterviewAttemptSummary` and `CompanyReviewQueueItem`
- Mutations: `markAttemptReviewStarted`, `setAttemptAiVerdict`, `setAttemptCompanyDecision`
- Filter: `companyReviewQueue(unreviewedOnly: true)`

### TASK-19.15

- Query: `attemptReviewNotes(attemptId)` — list notes with author name and timestamps
- Mutations: `createAttemptReviewNote`, `updateAttemptReviewNote` (author-only edit)
- Field on `InterviewAttemptSummary`: `hasTeamNotes` (compact table indicator)

### TASK-19.16

Table `interview_attempt_share_tokens` — tokenized read-only summary link per attempt.

- GraphQL (auth): `attemptShareLink`, `createAttemptShareLink`, `revokeAttemptShareLink`
- REST (public): `GET /api/public/attempt-share/:token` — score, recommendation, summary, strengths/weaknesses/risks; no transcript/email
- Regenerate revokes previous active token; expiry optional (7 / 30 days or none)

---

## Related

- [`interview-core.md`](interview-core.md) — `interview_attempts`
- [`ai-evaluation.md`](ai-evaluation.md) — `final_evaluations.hire_recommendation`
- [`analytics-cost.md`](analytics-cost.md) — `candidate_shortlist`
