# ⬜ TASK-07.2 — Prompt для checkpoint-оценки

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сформировать prompt pipeline для question-level оценки: модель получает вопрос, идеальный ответ и checkpoints из question bank и возвращает оценку по каждому checkpoint.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Prompt для checkpoint-оценки» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/src/modules/ai-evaluation/prompts/checkpoint-evaluation.prompt.ts`
- `backend/src/modules/ai-evaluation/services/checkpoint-evaluation.service.ts`
- `backend/src/modules/ai-evaluation/services/evaluation-context.service.ts`
- `backend/src/modules/question-bank/question-bank.repository.ts`

## Requirements

1. Источник checkpoints только `question_bank_checkpoints`; запрещено генерировать checkpoints через AI.
2. Prompt содержит: `question_text`, `expected_answer`, список checkpoints, ответ кандидата, transcript fragments.
3. Instruction-first формат с явным требованием вернуть JSON строго по схеме.
4. Для каждого checkpoint модель возвращает: `status`, `confidence`, `evidence_quote`, `reasoning_short`.
5. Если в ответе кандидата нет evidence, статус `not_met` и пустой quote.
6. Prompt versioning: `prompt_key` + `prompt_version` для аудита.

## Step-by-step Plan

1. Добавить сервис сборки evaluation context из таблиц question bank и interview answers.
2. Реализовать шаблон prompt с системным и пользовательским блоками.
3. Сохранить prompt metadata (key/version) в контекст AI вызова.
4. Покрыть unit-тестом кейс с отсутствующим checkpoint.
5. Проверить, что сервис не продолжает оценку, если checkpoints не найдены.

## Acceptance Criteria

- Оценка вопроса всегда опирается на checkpoints из question bank.
- Prompt детерминирован и версионируется.
- Нет логики AI-генерации checkpoint-критериев.

## Checks

```bash
cd backend && npm run test -- checkpoint-evaluation
cd backend && npm run build
rg "question_bank_checkpoints|prompt_version" /Users/sergeykamalyan/Desktop/russkiy/my-app/backend/src -n
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
