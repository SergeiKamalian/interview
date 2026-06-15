# TASK-09.14 — Ускорить adaptive submit (latency)

Status: [x] done

## Goal

Сократить время ответа на submit в adaptive flow. По логам ~98% времени уходило на два последовательных OpenAI-вызова (`evaluate_turn` ~5.5s + `plan_follow_up` ~1.8s).

## Changes

- Follow-up planner по умолчанию использует **template question** без LLM (`ADAPTIVE_FOLLOW_UP_USE_LLM=false`).
- Env `ADAPTIVE_FOLLOW_UP_USE_LLM=true` — opt-in для AI-формулировки follow-up.
- Template follow-up на русском: `Можете подробнее рассказать про «…»?`
- При ответе «не знаю» — **skip обоих AI calls** (см. TASK-09.15).

## Expected impact

- Обычный submit с follow-up: **~1.8s быстрее** (нет planner LLM).
- Submit с «не знаю»: **~7s → <100ms** (нет evaluate + planner).

## Completion Notes

- `pnpm --dir backend run test` — adaptive-interview specs pass.
- `pnpm --dir backend run build` — OK.
