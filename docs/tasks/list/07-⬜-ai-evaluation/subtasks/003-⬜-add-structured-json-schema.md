# ⬜ TASK-07.3 — Структурированная JSON-схема ответа AI

Status: [ ] todo  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Ввести строгую JSON Schema и runtime-валидацию ответа модели для checkpoint и финальной оценки с reject/repair стратегией при невалидном ответе.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Структурированная JSON-схема ответа AI» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/src/modules/ai-evaluation/schemas/checkpoint-evaluation.schema.ts`
- `backend/src/modules/ai-evaluation/schemas/final-evaluation.schema.ts`
- `backend/src/modules/ai-evaluation/services/ai-response-validator.service.ts`
- `backend/src/modules/ai-evaluation/types/evaluation.types.ts`

## Requirements

1. Схемы покрывают обязательные поля, enum-ы, диапазоны score и max length для текстовых полей.
2. Валидация выполняется до любых INSERT/UPDATE в БД.
3. При schema mismatch сервис делает один repair retry с более строгой инструкцией.
4. После второго провала результат маркируется как `invalid_ai_response` и пишется в лог ошибок.
5. Финальный контракт JSON отделен от внутренних DB entities.
6. Схема checkpoint-результата и схема финальной оценки независимы, но совместимы по score semantics.

## Step-by-step Plan

1. Определить TypeScript типы и JSON schema объекты.
2. Добавить validator service (ajv/zod runtime).
3. Интегрировать validator в pipeline до storage layer.
4. Реализовать retry policy для malformed JSON.
5. Добавить unit tests: valid payload, missing field, out-of-range score.

## Acceptance Criteria

- Невалидный JSON не попадает в persistent storage.
- Контракт ответа AI формализован и тестируем.
- Pipeline корректно обрабатывает malformed response.

## Checks

```bash
cd backend && npm run test -- ai-response-validator
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
