# Indexes & Performance Catalog

Cross-domain catalog of FK, unique constraints, indexes и hot-path queries.

**Sources:** migrations `002`–`010`, schemas `auth-company` … `ats-integrations`

---

## FK catalog

| Child table | FK column | Parent | ON DELETE |
|-------------|-----------|--------|-----------|
| company_memberships | company_id | companies | CASCADE |
| company_memberships | user_id | users | CASCADE |
| topics | skill_id | skills | SET NULL |
| questions | company_id | companies | CASCADE |
| questions | profession_id | professions | RESTRICT |
| questions | topic_id | topics | RESTRICT |
| question_skills | question_id | questions | CASCADE |
| question_skills | skill_id | skills | CASCADE |
| question_checkpoints | question_id | questions | CASCADE |
| answer_examples | question_id | questions | CASCADE |
| interviews | company_id | companies | RESTRICT |
| interviews | created_by_user_id | users | SET NULL |
| interviews | profession_id | professions | SET NULL |
| interview_questions | interview_id | interviews | CASCADE |
| interview_questions | source_question_id | questions | SET NULL |
| interview_question_checkpoints | interview_question_id | interview_questions | CASCADE |
| candidates | company_id | companies | RESTRICT |
| candidates | interview_id | interviews | CASCADE |
| interview_attempts | company_id | companies | RESTRICT |
| interview_attempts | interview_id | interviews | CASCADE |
| interview_attempts | candidate_id | candidates | CASCADE |
| interview_messages | company_id | companies | RESTRICT |
| interview_messages | interview_attempt_id | interview_attempts | CASCADE |
| interview_messages | interview_question_id | interview_questions | SET NULL |
| question_evaluations | company_id | companies | RESTRICT |
| question_evaluations | interview_attempt_id | interview_attempts | CASCADE |
| question_evaluations | interview_message_id | interview_messages | CASCADE |
| question_evaluations | interview_question_id | interview_questions | RESTRICT |
| checkpoint_results | question_evaluation_id | question_evaluations | CASCADE |
| final_evaluations | company_id | companies | RESTRICT |
| final_evaluations | interview_attempt_id | interview_attempts | CASCADE |
| ai_usage_logs | company_id | companies | RESTRICT |
| ai_usage_logs | interview_attempt_id | interview_attempts | SET NULL |
| ai_usage_logs | interview_message_id | interview_messages | SET NULL |
| media_assets | company_id | companies | RESTRICT |
| media_assets | interview_attempt_id | interview_attempts | CASCADE |
| media_assets | interview_message_id | interview_messages | SET NULL |
| media_transcripts | company_id | companies | RESTRICT |
| media_transcripts | media_asset_id | media_assets | CASCADE |
| media_transcripts | interview_message_id | interview_messages | SET NULL |
| analytics_daily_rollups | company_id | companies | CASCADE |
| integration_configs | company_id | companies | CASCADE |
| integration_deliveries | company_id | companies | CASCADE |
| integration_deliveries | integration_config_id | integration_configs | CASCADE |
| integration_deliveries | interview_attempt_id | interview_attempts | CASCADE |
| integration_logs | company_id | companies | CASCADE |
| integration_logs | integration_delivery_id | integration_deliveries | CASCADE |

---

## Index catalog by domain

### Auth (002–004)

| Table | Index | Purpose |
|-------|-------|---------|
| users | uq_users_email | Login |
| companies | uq_companies_slug | Tenant slug |
| company_memberships | uq_company_memberships_company_user | Uniqueness |
| company_memberships | idx_company_memberships_user_id | User → companies |

### Question bank (005)

| Table | Index | Purpose |
|-------|-------|---------|
| questions | idx_questions_profession_level_difficulty | Filter bank |
| questions | idx_questions_topic_id | Topic filter |
| questions | idx_questions_company_id | Company custom Q |
| question_checkpoints | uq_question_checkpoints_question_key | Key uniqueness |

### Interview (006)

| Table | Index | Purpose |
|-------|-------|---------|
| interviews | uq_interviews_public_token | Public lookup |
| interviews | idx_interviews_company_created | Dashboard pagination |
| interviews | idx_interviews_company_status | Filter by status |
| interview_attempts | idx_interview_attempts_company_status | Attempt lists |
| interview_attempts | idx_interview_attempts_company_shortlisted | Shortlist |
| interview_messages | uq_interview_messages_attempt_sequence | Ordering |

### AI evaluation (007)

| Table | Index | Purpose |
|-------|-------|---------|
| question_evaluations | uq_question_evaluations_message | Idempotency |
| final_evaluations | uq_final_evaluations_attempt | One final per attempt |
| final_evaluations | idx_final_evaluations_company_score | Ranking |
| ai_usage_logs | idx_ai_usage_logs_company_created | Cost over time |

### Media (008)

| Table | Index | Purpose |
|-------|-------|---------|
| media_assets | uq_media_assets_company_bucket_key | Storage uniqueness |

### Analytics (009)

| Table | Index | Purpose |
|-------|-------|---------|
| analytics_daily_rollups | uq_analytics_rollups_day_metric_dim | Upsert rollups |

### ATS (010)

| Table | Index | Purpose |
|-------|-------|---------|
| integration_deliveries | uq_integration_deliveries_idempotency | No duplicate sends |
| integration_deliveries | idx_integration_deliveries_status_retry | Retry worker |

---

## Hot path queries

### 1. Login by email

```sql
SELECT id, email, password_hash, full_name, is_active
FROM users WHERE email = ? AND is_active = 1;
```

**Index:** `uq_users_email`

**EXPLAIN check:** `type=const`, `key=uq_users_email`

---

### 2. Public interview lookup

```sql
SELECT id, title, status, level, question_count
FROM interviews
WHERE public_token = ? AND status = 'active';
```

**Index:** `uq_interviews_public_token`

**EXPLAIN check:** `type=const`, `key=uq_interviews_public_token`

---

### 3. Company dashboard — interviews list

```sql
SELECT id, title, status, created_at
FROM interviews
WHERE company_id = ?
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**Index:** `idx_interviews_company_created`

**EXPLAIN check:** `key=idx_interviews_company_created`, no filesort on large datasets if pagination uses indexed order

---

## Tenant query rule

Все company-scoped SELECT **должны** включать `WHERE company_id = ?` (из JWT/membership), кроме global question bank reads.

Composite indexes lead with `company_id` where applicable.

---

## Redundant indexes

No duplicate indexes identified. UNIQUE keys double as lookup indexes (email, public_token, slug).

---

## Performance notes

- Pagination: always `(company_id, created_at DESC)` pattern
- Analytics heavy queries: prefer views + rollups over live full scans
- JSON columns (`raw_response`): not indexed; not used in WHERE
- Batch retry worker: `idx_integration_deliveries_status_retry WHERE status='pending' AND next_retry_at <= NOW()`

---

## Related

- [`CONVENTIONS.md`](CONVENTIONS.md) — naming rules
- [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) — migration order
