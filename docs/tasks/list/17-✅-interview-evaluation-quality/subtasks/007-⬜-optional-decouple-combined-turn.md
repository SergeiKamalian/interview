# TASK-17.7 — (Опционально) Разнести combined-turn (оценка ≠ follow-up)

Status: [ ] todo

## Goal

Снять перегрузку роли оценщика: сейчас `ADAPTIVE_AI_COMBINED_TURN=true` заставляет один LLM-вызов одновременно оценивать чекпоинты и придумывать follow-up. Это экономит latency, но смешивает роли «судьи» и «ведущего». Опция — разнести на два вызова (оценка отдельно, follow-up отдельно).

## Depends on

- TASK-17.1 (model routing). Делать ТОЛЬКО если после 17.2–17.5 калибровка всё ещё хромает.

## Context

- Флаг: `backend/src/modules/adaptive-interview/config/adaptive-interview-context.config.ts` (`isAdaptiveAiCombinedTurnEnabled`).
- Оценщик: `per-turn-checkpoint-evaluator.service.ts` (в combined-режиме парсит `suggested_follow_up` из того же ответа).
- Planner: `follow-up-planner.service.ts` уже умеет планировать follow-up отдельно (есть LLM-ветка), combined лишь подсказывает.
- Trade-off: разнесение = +1 LLM-вызов на ход (latency/стоимость). Поэтому опционально и за флагом.

## Scope

- Не удаляя combined-режим, обеспечить корректную работу при `ADAPTIVE_AI_COMBINED_TURN=false`: оценка — чистый eval-вызов (без генерации follow-up), follow-up — отдельный вызов planner'а.
- Прогнать сравнение качества: combined vs split (на attempt 102 и golden) — зафиксировать, даёт ли split заметно более честную оценку.
- Рекомендацию по дефолту (оставить combined или переключить) записать в Completion Notes на основе данных.

## Verification

- `pnpm -C backend build` + targeted eslint.
- Прогон с `ADAPTIVE_AI_COMBINED_TURN=false`: интервью проходит, оценка и follow-up формируются корректно, нет регресса в follow-up-логике.
- `golden-calibration.spec.ts` зелёный в обоих режимах.
- Сравнение combined vs split на attempt 102 (числа в Completion Notes).

## Completion Notes

(заполнить: результаты сравнения combined vs split, рекомендация по дефолту)
