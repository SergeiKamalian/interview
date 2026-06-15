# Database Design — Index

Документация SQL-first схемы AI Interviewer Platform.

---

## Core documents

| Document | Description |
|----------|-------------|
| [CONVENTIONS.md](CONVENTIONS.md) | Naming, types, multi-tenant rules |
| [MIGRATIONS.md](MIGRATIONS.md) | Migration policy, runner flow |
| [INDEXES_AND_PERFORMANCE.md](INDEXES_AND_PERFORMANCE.md) | FK/index catalog, hot paths |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Migration roadmap, feature mapping |

---

## Domain schemas

| Schema | Tables | Migration |
|--------|--------|-----------|
| [auth-company.md](schemas/auth-company.md) | companies, users, company_memberships | 002–004 |
| [question-bank.md](schemas/question-bank.md) | professions, skills, topics, questions, checkpoints, examples | 005 |
| [interview-core.md](schemas/interview-core.md) | interviews, candidates, attempts, messages, snapshots | 006 |
| [ai-evaluation.md](schemas/ai-evaluation.md) | question_evaluations, checkpoint_results, final_evaluations, ai_usage_logs | 007 |
| [media-storage.md](schemas/media-storage.md) | media_assets, media_transcripts | 008 |
| [analytics-cost.md](schemas/analytics-cost.md) | rollups, views | 009 |
| [ats-integrations.md](schemas/ats-integrations.md) | integration_configs, deliveries, logs | 010 |
| [adaptive-ai-interview.md](schemas/adaptive-ai-interview.md) | checkpoint states, follow-ups, question summaries | 013 |

---

## Examples

| File | Purpose |
|------|---------|
| [schema_migrations.bootstrap.sql.example](schema_migrations.bootstrap.sql.example) | Bootstrap table reference |

---

## SQL migrations (deployed)

```txt
backend/migrations/
  001_create_schema_migrations.sql
  002_create_companies.sql
  003_create_users.sql
  004_create_company_memberships.sql
  005_create_question_bank.sql
  006_create_interview_core.sql
  007_create_ai_evaluation.sql
  008_create_media_storage.sql
  009_create_analytics.sql
  010_create_ats_integrations.sql
  011_create_auth_sessions.sql
  012_create_candidate_shortlist.sql
  013_create_adaptive_ai_interview.sql
```

Apply: `cd backend && pnpm run migrate`

---

## Block status

Database design block `02-✅-database-design` — complete.

Feature blocks 04–12 implement application code against this schema.
