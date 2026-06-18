# TASK-14.37 — Fix follow-up Cyrillic mojibake (ENC-01)

**Status:** [x] done  
**Bug:** ENC-01  
**Block:** 14-✅-evaluation-accuracy-analytics

---

## Problem

Follow-up templates showed mojibake instead of Cyrillic:

- `стек` → `ÑÑ‚ÐµÐº`
- `и` → `Ð¸`

Reproduced on attempt **#91** and **#92** (`plan_follow_up.combined_turn_template`).

## Root cause

1. MySQL pools (`DatabaseService`, seed, migrate) did not set `charset: 'utf8mb4'`.
2. `fiber-evaluation-hints.seed.sql` was applied with a latin1 session → UTF-8 Cyrillic in JSON was **double-encoded** in `question_checkpoints.evaluation_hints` and copied to `interview_question_checkpoints`.
3. `stack_vs_fiber` lacked `probeConceptGroups` in seed → fallback joined raw `mustConcepts` (`call stack, стек`) into candidate-facing text.

## Fix

- `charset: 'utf8mb4'` on all MySQL pool constructors.
- Add `probeConceptGroups` for `stack_vs_fiber` in `fiber-evaluation-hints.seed.sql`.
- Re-apply seed to repair bank + interview snapshots.

## Verification

```bash
# Re-apply seed (utf8mb4 connection)
cd backend && MYSQL_HOST=localhost MYSQL_PORT=3322 MYSQL_USER=ai_interviewer \
  MYSQL_PASSWORD=changeme MYSQL_DATABASE=ai_interviewer \
  node -e "const {readFileSync}=require('fs');const mysql=require('mysql2/promise');(async()=>{const p=mysql.createPool({host:process.env.MYSQL_HOST,port:3322,user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,charset:'utf8mb4',multipleStatements:true});await p.query(readFileSync('seeds/fiber-evaluation-hints.seed.sql','utf8'));const[r]=await p.query(\"SELECT JSON_UNQUOTE(JSON_EXTRACT(evaluation_hints,'$.probeConceptGroups[1].ask')) AS ask FROM question_checkpoints WHERE checkpoint_key='scheduling' LIMIT 1\");console.log(r[0].ask);await p.end();})();"
```

**Expected:** `MessageChannel и postMessage` (correct Cyrillic «и»).

**Got (2026-06-18):** `MessageChannel и postMessage` ✅

Live QA attempt #92: after backend restart + new follow-up, template should show «чем stack reconciler отличается от Fiber» instead of mojibake `стек`.

## Completion Notes

- Commands: DB query before/after seed; confirmed double-encoded bytes `c390c2b8` for «и» in corrupted rows.
- Re-applied `seeds/fiber-evaluation-hints.seed.sql` with `charset: 'utf8mb4'`.
- Changed: `database.service.ts`, `seed/main.ts`, `migrate/main.ts`, `fiber-evaluation-hints.seed.sql`.
- ENC-01 marked **fixed** in `docs/evaluation-accuracy/README.md` §16.
