# ⬜ TASK-02.7 — Спроектировать схему media metadata

Status: [ ] todo
Priority: Medium
Parent block: `02-⬜-database-design`
Owner: Cursor / Sergey
Last updated: 2026-06-12

---

## Goal

Спроектировать таблицы метаданных для audio/video: storage keys, mime types, duration, linkage to interview_attempts.

---

## Context

Файлы audio/video хранятся в object storage / filesystem; в MySQL только metadata и ссылки. Блок 09 voice-video будет использовать эту схему.

---

## Scope

- Создать `docs/database/schemas/media-storage.md`.
- Таблицы: `media_assets`, optional `media_transcripts`.
- Поля: `storage_key`, `bucket`, `mime_type`, `file_size_bytes`, `duration_ms`, `media_type` (`audio`|`video`).
- FK: `interview_attempt_id`, `company_id`.
- `media_transcripts`: STT result text, `source` (`stt`|`manual`).

---

## Out of Scope

- Реальный file upload (блок 09).
- S3/production storage setup (блок 11).

---

## Files / Folders Allowed

```txt
docs/database/schemas/media-storage.md
```

---

## Requirements

1. Бинарные данные не в MySQL BLOB (MVP policy).
2. `storage_key` unique per company+bucket.
3. Soft reference to REST download URL pattern.
4. Retention policy note (design only).
5. Link audio asset to specific `interview_message_id` optional.

---

## Step-by-step Plan

1. ER diagram media tables.
2. DDL design.
3. Example row for audio recording and video recording.
4. STT transcript linkage design.
5. Cross-ref voice-video block 09.

---

## Acceptance Criteria

- Media metadata schema documented.
- No BLOB storage in MySQL.
- FK to interview_attempts defined.
- STT transcript storage designed.

---

## Checks

```bash
test -f docs/database/schemas/media-storage.md
rg "media_assets|storage_key" docs/database/schemas/media-storage.md
```

---

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, ссылки на design-документы._
