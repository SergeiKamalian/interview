# ⬜ TASK-07.6 — Хранение финальной оценки интервью

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сохранить итоговую AI-оценку по интервью: общий score, рекомендация, риски и summary для hiring manager.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Хранение финальной оценки интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/migrations/0xz_create_final_evaluations.sql`
- `backend/src/modules/ai-evaluation/repositories/final-evaluation.repository.ts`
- `backend/src/modules/ai-evaluation/graphql/final-evaluation.type.ts`
- `backend/src/modules/ai-evaluation/services/final-evaluation.service.ts`

## Requirements

1. Таблица `final_evaluations`: `id`, `interview_id`, `overall_score`, `recommendation`, `summary`, `risks_json`, `next_steps_json`, `evaluated_at`.
2. Уникальность по `interview_id` (одно актуальное финальное заключение).
3. Enum recommendation: `strong_hire`, `hire`, `hold`, `no_hire`.
4. Финальная оценка запускается только после завершения question-level оценок.
5. Summary ограничить, например, 2000 символами.
6. Поля рисков и next steps хранить в JSON.

## Step-by-step Plan

1. Добавить SQL-миграцию и индекс по `overall_score`.
2. Создать repository `upsertByInterviewId`.
3. Реализовать сервис генерации финальной оценки на основе question_evaluations.
4. Добавить GraphQL query `finalEvaluationByInterview`.
5. Проверить повторный запуск: запись обновляется, а не дублируется.

## Acceptance Criteria

- Финальная оценка интервью стабильно сохраняется.
- Данные пригодны для dashboard/report страницы.
- Повторный расчет остается идемпотентным.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- final-evaluation
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
