# TASK-14.29 — Wire classifier into submit + policy

Status: [x] done

## Depends on

TASK-14.28

## Problem

Classifier существует, но policy всё ещё читает regex (`resolveScopeClarificationDisposition`, `isFullQuestionDecline`, `isScopeClarificationTurn`).

## Solution

- `adaptive-interview-submit.service.ts`: `classifyTurn()` перед evaluate; fast-path `decline_whole` через classifier
- `follow-up-policy.util.ts`: `turn_kind` вместо `isScopeClarificationTurn`
- `apply-checkpoint-score-floors.util.ts`: убрать regex disposition override
- `topic-mismatch.util.ts`: classifier flags

## Acceptance criteria

- [x] Нет regex override disposition после evaluate
- [x] Fiber clarification scenario (14.27) проходит без regex
- [x] `pnpm test` policy + submit specs green

## Completion Notes

**Команды:**
```bash
cd backend && pnpm test -- candidate-turn-classifier candidate-clarification follow-up-policy.clarification apply-checkpoint-score-floors topic-mismatch candidate-decline follow-up-policy.probe golden-calibration
cd backend && pnpm build
```

**Ожидание:** 110 passed (1 skipped), build без ошибок.

**Результат:** 10 suites passed, 110 passed / 1 skipped; `nest build` OK.

**Изменения:**
- Submit: `classifyTurn()` → `decline_whole` fast-path → evaluate/plan с `candidateTurnKind` + `candidateDispositionFromClassifier`
- Policy/floors/topic-mismatch: `turn_kind` как source of truth; regex только fallback без classifier
- Тесты обновлены под classifier-first API
- `candidate-turn-classifier.json` исключён из score golden calibration; bands обновлены для probe-pending (wave 2)
- Тип `topic_opener_answer` добавлен в context packet
