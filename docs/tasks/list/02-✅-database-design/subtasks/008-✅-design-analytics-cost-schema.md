# ⬜ TASK-02.8 — Спроектировать схему analytics и AI cost

Status: [ ] todo
Priority: Medium
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы/представления для dashboard analytics: агрегаты по topic/skill/question, shortlist, AI cost rollups.

---

## Context

Блок 08 dashboard-analytics требует быстрые запросы по кандидатам, темам, навыкам и AI расходам. Часть можно через SQL views/materialized summaries.

---

## Scope

- Создать `docs/database/schemas/analytics-cost.md`.
- Design: `analytics_daily_rollups` (optional), SQL views `v_candidate_scores`, `v_topic_averages`.
- Shortlist: query design using `final_evaluations` + filters, или table `shortlist_entries`.
- AI cost: aggregate from `ai_usage_logs` by company/interview/day.
- Indexes supporting GROUP BY topic/skill/question.

---

## Out of Scope

- Реальные views/migrations.
- Frontend charts (блок 08).

---

## Files / Folders Allowed

```txt
docs/database/schemas/analytics-cost.md
```

---

## Requirements

1. MVP: analytics via SQL views, не отдельный OLAP DB.
2. Document slow query risks and required indexes.
3. Shortlist: `is_shortlisted` flag on attempt or junction table — choose and document.
4. Rollup strategy: on-write vs nightly job (design decision).
5. AI cost fields: sum `cost_usd` by `company_id`, `interview_id`.

---

## Step-by-step Plan

1. List all dashboard metrics from PROJECT.md section 18.
2. Map each metric to source tables/views.
3. Design view SQL (as reference, not deployed).
4. Index recommendations for analytics queries.
5. Shortlist data model decision.

---

## Acceptance Criteria

- All MVP analytics metrics mapped to schema.
- AI cost aggregation design documented.
- Shortlist storage approach chosen.
- View/index design references interview + evaluation tables.

---

## Checks

```bash
test -f docs/database/schemas/analytics-cost.md
rg "ai_usage_logs|shortlist|v_topic" docs/database/schemas/analytics-cost.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
