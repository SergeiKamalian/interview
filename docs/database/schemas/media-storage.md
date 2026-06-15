# Media Storage Schema

Binary files **не в MySQL** — только metadata + storage keys.

**Migration:** `008_create_media_storage.sql` · **Feature block:** `10-⬜-voice-video`

---

## Policy

| Rule | Detail |
|------|--------|
| No BLOB | Audio/video in object storage / local filesystem |
| Metadata in MySQL | `media_assets` + optional `media_transcripts` |
| Download | REST `/files/:id` (block 10), not GraphQL |
| Retention | Design: 90 days default post-MVP; configurable per company |

---

## `media_assets`

| Column | Notes |
|--------|-------|
| `media_type` | audio \| video |
| `storage_bucket` | e.g. `local`, `s3-prod` |
| `storage_key` | Path/key in bucket |
| `mime_type` | audio/webm, video/mp4, … |
| `file_size_bytes` | BIGINT |
| `duration_ms` | Optional |
| `interview_attempt_id` | FK CASCADE |
| `interview_message_id` | Optional link to answer message |

UNIQUE `(company_id, storage_bucket, storage_key(191))` — prefix index for utf8mb4 limit

**Download URL pattern (design):**

```txt
GET /api/files/{media_asset_id}
Authorization: Bearer <company-user-jwt>
```

---

## `media_transcripts`

STT output linked to media asset.

| Column | Notes |
|--------|-------|
| `transcript_text` | TEXT |
| `source` | stt \| manual |
| `media_asset_id` | UNIQUE (1:1 with asset) |
| `interview_message_id` | Optional sync to message content |

Evaluation uses transcript text → `interview_messages.content` or linked transcript.

---

## Example rows

**Audio answer:**

```txt
media_type=audio, storage_key=attempts/42/messages/7.webm, duration_ms=12500
```

**Video interview:**

```txt
media_type=video, storage_key=attempts/42/session.webm, duration_ms=600000
```

---

## DDL reference

`backend/migrations/008_create_media_storage.sql`

---

## Related

- [`interview-core.md`](interview-core.md) — attempts, messages
