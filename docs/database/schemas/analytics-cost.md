# Analytics & AI Cost Schema

Dashboard analytics через SQL views + optional rollups table. No separate OLAP DB in MVP.

**Migration:** `009_create_analytics.sql` · **Feature block:** `08-⬜-dashboard-analytics`

---

## MVP metrics mapping (PROJECT.md §18)

| Metric | Source |
|--------|--------|
| Total candidates | `COUNT(candidates)` per company |
| Started / completed | `interview_attempts.status` |
| Completion rate | completed / started |
| Average / median score | `final_evaluations.total_score` |
| Best / weak candidates | ORDER BY score |
| Category distribution | `final_evaluations.category` GROUP BY |
| Avg score by topic | `v_topic_averages` view |
| Avg score by question | `question_evaluations` GROUP BY question |
| AI cost by company/day | `v_ai_cost_by_company_day` |
| Shortlist | `interview_attempts.is_shortlisted = 1` |

---

## Shortlist decision

**Chosen:** `is_shortlisted` flag on `interview_attempts` (simple MVP).

Optional curation notes → future `shortlist_entries` table post-MVP.

Query:

```sql
SELECT * FROM v_candidate_scores
WHERE company_id = ? AND is_shortlisted = 1
ORDER BY total_score DESC;
```

---

## Rollup strategy

**Decision:** hybrid

| Layer | Strategy |
|-------|----------|
| Real-time dashboard | SQL views on normalized tables |
| Heavy aggregates | `analytics_daily_rollups` filled by nightly job (block 08) |

### `analytics_daily_rollups`

| Column | Notes |
|--------|-------|
| `rollup_date` | DATE |
| `metric_key` | e.g. `topic_avg_score`, `ai_cost_usd` |
| `dimension_key` / `dimension_value` | e.g. topic name |
| `metric_value`, `sample_count` | Aggregated |

UNIQUE `(company_id, rollup_date, metric_key, dimension_key, dimension_value)`

---

## SQL views (deployed)

### `v_candidate_scores`

Joins attempts + candidates + interviews + final_evaluations for dashboard list.

### `v_topic_averages`

`AVG(qe.score)` GROUP BY `company_id`, `topic_name`.

### `v_ai_cost_by_company_day`

Sum `cost_usd` from `ai_usage_logs` by day.

---

## Index support for analytics

Already in domain migrations:

- `idx_final_evaluations_company_score`
- `idx_ai_usage_logs_company_created`
- `idx_interview_attempts_company_shortlisted`
- `idx_question_evaluations_attempt_id`

---

## Slow query risks

| Query | Risk | Mitigation |
|-------|------|------------|
| Topic averages over all time | Full scan on evaluations | Rollups + date filter |
| Company candidate list | Large tenants | `(company_id, created_at)` pagination |
| AI cost monthly | Scan logs | `idx_ai_usage_logs_company_created` |

---

## DDL reference

`backend/migrations/009_create_analytics.sql`

---

## Related

- [`ai-evaluation.md`](ai-evaluation.md) — scores, ai_usage_logs
- [`interview-core.md`](interview-core.md) — attempts, shortlist flag
