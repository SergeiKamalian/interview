# ⬜ TASK-07.5 — Хранение результата по checkpoint

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить таблицу детальных checkpoint-результатов, чтобы хранить статус каждого критерия и evidence для explainability.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Хранение результата по checkpoint» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/migrations/0xy_create_checkpoint_results.sql`
- `backend/src/modules/ai-evaluation/repositories/checkpoint-result.repository.ts`
- `backend/src/modules/ai-evaluation/graphql/checkpoint-result.type.ts`

## Requirements

1. Таблица `checkpoint_results`: `id`, `question_evaluation_id`, `checkpoint_id`, `status`, `confidence`, `evidence_quote`, `reasoning_short`, `created_at`.
2. FK `checkpoint_id` ссылается на `question_bank_checkpoints.id`.
3. Enum `status`: `met`, `partially_met`, `not_met`, `not_applicable`.
4. Уникальность `(question_evaluation_id, checkpoint_id)`.
5. Если checkpoint удален/архивирован в банке, оценка старой версии вопроса не должна ломаться (использовать versioned checkpoint id).
6. Сохранять confidence в диапазоне 0..1.

## Step-by-step Plan

1. Добавить SQL-миграцию и индексы по `question_evaluation_id`.
2. Реализовать batch insert/update checkpoint результатов.
3. Интегрировать map из AI JSON в записи таблицы.
4. Добавить выборку `findByQuestionEvaluationId` для dashboard.
5. Проверить корректность статусов enum.

## Acceptance Criteria

- Каждый checkpoint имеет отдельную persisted оценку.
- Explainability данные (quote/reasoning) доступны для UI.
- Схема поддерживает idempotent обновление.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run test -- checkpoint-result
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
