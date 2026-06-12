# ⬜ TASK-02.9 — Спроектировать схему ATS integrations

Status: [ ] todo
Priority: Medium
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы webhook config, integration logs, export jobs и retry queue metadata для ATS.

---

## Context

Блок 10 ATS integrations отправляет результаты во внешние системы. Нужны audit logs, retry и idempotency.

---

## Scope

- Создать `docs/database/schemas/ats-integrations.md`.
- Таблицы: `integration_configs`, `integration_logs`, `integration_deliveries`.
- `integration_configs`: `webhook_url`, `secret`, `enabled`, `company_id`.
- `integration_logs`: request/response payload refs, `status`, `attempt_count`.
- `integration_deliveries`: idempotency key per `interview_attempt_id` + destination.

---

## Out of Scope

- Webhook HTTP implementation (блок 10).
- Export CSV/JSON generation code.

---

## Files / Folders Allowed

```txt
docs/database/schemas/ats-integrations.md
```

---

## Requirements

1. Webhook secret stored hashed or encrypted (design note).
2. Payload JSON schema reference for ATS export.
3. Retry: `next_retry_at`, `max_attempts`, exponential backoff policy.
4. Log retention policy (design).
5. FK: all tables `company_id` scoped.

---

## Step-by-step Plan

1. ER diagram ATS tables.
2. DDL design.
3. Example webhook payload (from PROJECT.md section 17).
4. Retry state machine design.
5. Cross-ref block 10 ats-integrations.

---

## Acceptance Criteria

- ATS schema covers config, logs, deliveries.
- Retry/idempotency design documented.
- Example export payload included.
- Company-scoped isolation.

---

## Checks

```bash
test -f docs/database/schemas/ats-integrations.md
rg "integration_logs|webhook_url" docs/database/schemas/ats-integrations.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
