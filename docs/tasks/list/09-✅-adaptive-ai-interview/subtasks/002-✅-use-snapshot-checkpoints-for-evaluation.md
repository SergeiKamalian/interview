# TASK-09.2 — Использовать snapshot checkpoints в AI evaluation

Status: [x] done

## Goal

Исправить текущую evaluation context логику: AI evaluation должна брать checkpoints из `interview_question_checkpoints`, а не из live question bank по `sourceQuestionId`.

## Why

При создании interview backend уже snapshot-ит question/checkpoints. Если потом question bank изменится, старые interviews должны оцениваться по своим original criteria.

## Current Problem

`EvaluationContextService` сейчас грузит checkpoints через `QuestionBankRepository.findCheckpointsByQuestionId(sourceQuestionId)`. Это нарушает snapshot policy.

## Scope

- Добавить repository method для загрузки `interview_question_checkpoints` по `interview_question_id`.
- Обновить `EvaluationContextService`.
- Убрать dependency на `QuestionBankRepository` там, где она нужна только для checkpoint loading.
- Сохранить response shape для существующей AI evaluation.
- Добавить unit tests.

## Requirements

- Если snapshot checkpoints отсутствуют, возвращать controlled error `CHECKPOINTS_NOT_FOUND`.
- `checkpoint_key`, `title`, `expected`, `score`, `sort_order` должны совпадать с snapshot table.
- Live question bank не должен использоваться при evaluation completed attempt.

## Verification

- Unit test: изменение question bank после создания interview не меняет evaluation context.
- `pnpm --dir backend run test -- evaluation-context` или релевантный spec.
- `pnpm --dir backend run build`.

## Completion Notes

### Изменённые files

- `backend/src/modules/interview-core/interview-core.repository.ts` — `findCheckpointsByInterviewQuestionId`
- `backend/src/modules/ai-evaluation/services/evaluation-context.service.ts` — snapshot loading
- `backend/src/modules/ai-evaluation/services/evaluation-context.service.spec.ts` — new unit tests
- `backend/src/modules/ai-evaluation/services/checkpoint-evaluation.service.spec.ts` — updated mocks
- `backend/src/modules/ai-evaluation/ai-evaluation.module.ts` — removed unused `QuestionBankModule` import

### Команды

```bash
cd backend && pnpm run test -- evaluation-context
cd backend && pnpm run test -- checkpoint-evaluation.service.spec
cd backend && pnpm run build
```

### Expected

- Evaluation context loads checkpoints from `interview_question_checkpoints` by `interview_question_id`.
- Empty snapshot → `CHECKPOINTS_NOT_FOUND`.
- Tests and build pass.

### Actual

- All 3 `evaluation-context` tests passed.
- All 3 `checkpoint-evaluation.service.spec` tests passed.
- `nest build` succeeded.
- Migrations not required (table `interview_question_checkpoints` already exists in migration `006`).
