# TASK-14.23 — UI: уверенность AI в оценке (clarity)

Status: [x] done

## Problem (Attempt 82)

HR видел `confidence 95%` зелёным на checkpoint `missed` / «Не оценено» и трактовал это как «кандидат знает на 95%».  
На самом деле поле = **уверенность модели в своём вердикте** (статус + балл), не уровень знаний.

## Goal

Сделать подписи однозначными: HR понимает разницу между coverage/accuracy/score и confidence AI.

## Scope

- `AdaptiveCheckpointReviewPanel`: переименовать confidence, нейтральные цвета badge
- `missed` + depth «Не оценено» → «Не затронул»
- Оси Coverage/Accuracy → русские подписи
- Легенда в панели

Out of scope: backend rename поля, replay probe policy (→ 14.24).

## Acceptance criteria

- [x] Badge: «Уверенность AI в оценке: N% (высокая|средняя|низкая)»
- [x] Tooltip: confidence ≠ знания кандидата
- [x] Высокая confidence при missed — нейтральный (slate), не зелёный
- [x] missed/unclear без depth → «Не затронул»
- [x] Легенда объясняет уверенность AI

## Verification

```bash
cd frontend && pnpm run build
```

Browser QA: `http://localhost:5174/dashboard/interviews/12?attemptId=82`

- Карточка «Знает структуру fiber-узла»: missed, «Не затронул», badge «Уверенность AI в оценке: 95% (высокая)» (slate, не green)
- Легенда под заголовком «Оценка по критериям»

## Completion Notes

- Команды: `pnpm --dir frontend run build` — OK
- Browser: attempt 82, fiber_pointers card — labels as expected
- Reference case: interview 12 / attempt 82 (`docs/evaluation-accuracy/README.md` § Post-14)
