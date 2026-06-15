# TASK-09.7 — Добавить follow-up planner и policy limits

Status: [x] done

## Goal

Добавить controlled planner, который решает, нужен ли follow-up, и формулирует уточнение строго по missing/unclear checkpoint.

## Scope

- Добавить backend policy service:
  - max follow-ups per question;
  - max follow-ups per checkpoint;
  - priority by checkpoint score/status;
  - skip if enough score/evidence;
  - skip on timeout/manual review.
- Добавить AI follow-up planner prompt/schema.
- Сохранять planned/asked follow-up в `interview_follow_ups`.
- Валидировать `checkpointKey` against snapshot checkpoints/state.

## Decision Split

Backend решает:

- можно ли ещё спрашивать follow-up;
- какие checkpoints eligible;
- какие лимиты уже исчерпаны.

AI решает:

- как коротко и естественно сформулировать уточняющий вопрос по выбранному/eligible checkpoint.

AI не решает свободно тему интервью.

## Requirements

- Не более 1 follow-up на один checkpoint по default.
- Не более 3 follow-ups на main question по default.
- Follow-up question must be short and specific.
- Follow-up must not reveal ideal answer directly.
- If AI planner invalid, fallback to template question from checkpoint title/expected or skip with manual review.

## Verification

- Unit test: planner cannot choose already covered checkpoint.
- Unit test: planner cannot exceed per-question limit.
- Unit test: unknown checkpoint rejected.
- Unit test: fallback path works when AI provider fails.
- `pnpm --dir backend run test`.

## Completion Notes

- Policy defaults: `ADAPTIVE_MAX_FOLLOW_UPS_PER_QUESTION=3`, `ADAPTIVE_MAX_FOLLOW_UPS_PER_CHECKPOINT=1`, `ADAPTIVE_QUESTION_SCORE_SUFFICIENT_RATIO=0.6`, `ADAPTIVE_LOW_WEIGHT_CHECKPOINT_RATIO=0.2`; eligible statuses `missed|unclear|partial` (partial only when score < max); priority weight → unclear before missed → sort_order; skip on `needs_manual_review` and question follow-up limit.
- AI planner schema: `{ follow_up_question, reason }` via `follow-up-planner.schema.ts`; validator rejects empty question.
- Fallback behavior: on AI provider failure or invalid JSON after repair → template from checkpoint title (`Can you elaborate on …?`); still persists `interview_follow_ups` with status `planned` and increments `follow_up_count`.
- Tests:
  - `pnpm --dir backend run test -- follow-up` → 3 suites, 9 tests passed
  - `pnpm --dir backend run build` → success (fixed missing `CheckpointStateRepository` import in module)
- Not wired into public submit flow yet (TASK-09.8).
