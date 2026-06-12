# Database Implementation Plan

Ordered roadmap для SQL migrations и mapping на feature-блоки.

**Status:** migrations `001`–`010` **deployed** to dev DB (2026-06-12).

---

## Migration roadmap

| # | File | Domain | Feature block |
|---|------|--------|---------------|
| 001 | `create_schema_migrations.sql` | bootstrap | 01 backend-foundation |
| 002 | `create_companies.sql` | auth | 04 auth-company |
| 003 | `create_users.sql` | auth | 04 auth-company |
| 004 | `create_company_memberships.sql` | auth | 04 auth-company |
| 005 | `create_question_bank.sql` | question bank | 05 question-bank |
| 006 | `create_interview_core.sql` | interview | 06 interview-core |
| 007 | `create_ai_evaluation.sql` | AI eval | 07 ai-evaluation |
| 008 | `create_media_storage.sql` | media | 09 voice-video |
| 009 | `create_analytics.sql` | analytics | 08 dashboard-analytics |
| 010 | `create_ats_integrations.sql` | ATS | 10 ats-integrations |

---

## Dependency chain

```txt
001 → 002 → 003 → 004 → 005 → 006 → 007 → 008
                              ↘     ↓     ↓
                                009   010
```

- 008 media depends on 006 (attempts, messages)
- 009 analytics depends on 007 (evaluations, ai_usage_logs)
- 010 ATS depends on 007 (final_evaluations via attempts)

---

## Feature block → work mapping

### Block 04 — auth-company

| Subtask | DB work | App work |
|---------|---------|----------|
| 04.1 tables | ✅ migrations 002–004 applied | — |
| 04.2+ | — | AuthModule, JWT, GraphQL |

**Gate:** design doc [`schemas/auth-company.md`](schemas/auth-company.md) ✅

### Block 05 — question-bank

| Work | Status |
|------|--------|
| Schema 005 | ✅ applied |
| Seed data | TODO in block 05 |
| GraphQL CRUD | TODO in block 05 |

### Block 06 — interview-core

Schema 006 ✅ — implement GraphQL + public flow.

### Block 07 — ai-evaluation

Schema 007 ✅ — implement AI service + structured JSON parsing.

### Block 08 — dashboard-analytics

Schema 009 ✅ — views + rollups job + dashboard UI.

### Block 09 — voice-video

Schema 008 ✅ — REST upload + STT integration.

### Block 10 — ats-integrations

Schema 010 ✅ — webhook worker + retry logic.

---

## Pre-flight checklist (before block 04 app code)

- [x] `docs/database/CONVENTIONS.md` exists
- [x] `docs/database/MIGRATIONS.md` exists
- [x] All domain schema docs in `docs/database/schemas/`
- [x] `INDEXES_AND_PERFORMANCE.md` reviewed
- [x] Migrations 002–004 applied locally
- [x] `SHOW TABLES` shows auth tables
- [x] FK constraints verified

---

## Dev rollout

```bash
# Infrastructure
docker compose up -d mysql redis

# Apply all migrations
cd backend && pnpm run migrate

# Verify
docker compose exec mysql mysql -uai_interviewer -pchangeme ai_interviewer -e "SHOW TABLES;"
docker compose exec mysql mysql -uai_interviewer -pchangeme ai_interviewer -e "SELECT version FROM schema_migrations ORDER BY version;"
```

---

## Production rollout (block 11)

1. Backup MySQL snapshot
2. Run `migrate` one-shot container
3. Verify `schema_migrations` row count
4. Start backend
5. Smoke test `/health` + GraphQL

---

## Design before code rule

```txt
Feature block MUST reference docs/database/schemas/<domain>.md before new migrations.
New migrations after 010 require design doc update + sequential NNN_ filename.
```

---

## Related

- [`README.md`](README.md) — doc index
- [`MIGRATIONS.md`](MIGRATIONS.md) — runner policy
