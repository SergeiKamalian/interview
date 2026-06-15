# ✅ TASK-07.4 — Хранение оценки по вопросу

Status: [x] done  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Создать таблицу и repository для хранения агрегированной AI-оценки конкретного ответа на вопрос интервью.

## Context

После блока 06 уже существует interview flow и ответы кандидата. В блоке 07 backend вызывает OpenAI Chat Completions, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Хранение оценки по вопросу» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/migrations/0xx_create_question_evaluations.sql`
- `backend/src/modules/ai-evaluation/repositories/question-evaluation.repository.ts`
- `backend/src/modules/ai-evaluation/entities/question-evaluation.entity.ts`
- `backend/src/modules/ai-evaluation/graphql/question-evaluation.type.ts`

## Requirements

1. Таблица `question_evaluations`: `id`, `interview_id`, `interview_question_id`, `candidate_answer_id`, `score_raw`, `score_normalized`, `strengths_json`, `gaps_json`, `created_at`.
2. FK на `interviews`, `interview_questions`, `candidate_answers`.
3. Уникальность по `candidate_answer_id` для idempotent re-run.
4. JSON-поля сохраняются как `JSON`/`TEXT` с сериализацией на repository уровне.
5. Запись создается только после успешной schema-валидации AI payload.
6. Никаких Prisma migrations — только SQL файл + migration runner.

## Step-by-step Plan

1. Добавить SQL-миграцию для `question_evaluations` и индексы по `interview_id`, `interview_question_id`.
2. Создать repository с методами `upsertByCandidateAnswer` и `findByInterviewId`.
3. Интегрировать запись в checkpoint evaluation pipeline.
4. Добавить GraphQL type для чтения dashboard-слоем.
5. Проверить idempotent повторный запуск оценки.

## Acceptance Criteria

- Оценка вопроса сохраняется в отдельной таблице.
- Повторный запуск не создает дубликаты.
- Есть индексы для выборок по интервью.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
rg "question_evaluations" /Users/sergeykamalyan/Desktop/russkiy/my-app/backend -n
```

## Completion Notes

**Сделано:**

- Использована существующая DDL из `007_create_ai_evaluation.sql` (design doc block 02): `interview_message_id` вместо `candidate_answer_id`, `score`/`max_score`/`raw_response`/`short_summary`/`review`.
- `QuestionEvaluationRepository`: `upsertByInterviewMessage` (idempotent `ON DUPLICATE KEY UPDATE` по `interview_message_id`), `findByInterviewId`, `findByAttemptId`.
- `question-evaluation.mapper.ts` — расчёт score из checkpoint statuses (met / partially_met / not_met).
- `AiEvaluationService.evaluateAndPersistQuestionAnswer` — persist только после `status: valid`.
- GraphQL: `questionEvaluationsByInterview`, `questionEvaluationsByAttempt`.
- `EvaluationContextService` — добавлен `candidateMessageId`.

**Проверки:**

```bash
cd backend && npm run migrate   # up to date
cd backend && npm run build     # OK
cd backend && npm run lint      # OK
cd backend && npm run test -- "question-evaluation|ai-evaluation.service|checkpoint-evaluation|ai-response-validator"  # 14 passed
rg "question_evaluations" backend -n
```

**Компромисс:** отдельная migration `0xx` не создавалась — таблица уже была в block 02/007.

**Follow-ups:** TASK-07.5 — persist `checkpoint_results` rows linked to `question_evaluation_id`.
