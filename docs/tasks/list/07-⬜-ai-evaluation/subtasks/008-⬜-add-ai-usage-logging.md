# ⬜ TASK-07.8 — Логирование использования AI

Status: [ ] todo  
Priority: Medium  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить аудит AI-вызовов: провайдер, модель, токены, latency, estimated cost и связь с интервью для cost analytics.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 06 backend вызывает LLM-провайдера, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Логирование использования AI» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/migrations/0ya_create_ai_usage_logs.sql`
- `backend/src/modules/usage-logging/ai-usage-log.repository.ts`
- `backend/src/modules/usage-logging/ai-usage-log.service.ts`
- `backend/src/modules/ai-provider/ai-provider.service.ts`
- `backend/src/modules/usage-logging/graphql/ai-usage-log.type.ts`

## Requirements

1. Таблица `ai_usage_logs`: `id`, `interview_id`, `question_id`, `provider`, `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `latency_ms`, `estimated_cost_usd`, `status`, `created_at`.
2. Запись создается для каждого AI request независимо от успеха (status `success|error|invalid_response`).
3. Не хранить полный prompt/response body в таблице usage (только metadata).
4. Вычисление стоимости по configurable price map на 1K tokens.
5. Индексы: `created_at`, `interview_id`, `model`.
6. Логировать correlation id запроса для трассировки.

## Step-by-step Plan

1. Добавить SQL-миграцию `ai_usage_logs`.
2. Реализовать сервис подсчета токенов/стоимости из provider response.
3. Интегрировать логирование в `AiProviderService` обертку.
4. Добавить GraphQL query для cost summary по периоду.
5. Проверить, что error кейсы тоже пишутся в лог.

## Acceptance Criteria

- Есть полный аудит AI-вызовов для аналитики и биллинга.
- Успешные и ошибочные запросы различимы по status.
- Лог не содержит чувствительных данных prompt/response.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- ai-usage-log
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
