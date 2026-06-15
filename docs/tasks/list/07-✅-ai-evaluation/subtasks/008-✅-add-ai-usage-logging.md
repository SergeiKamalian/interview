# ✅ TASK-07.8 — Логирование использования AI

Status: [x] done

## Completion Notes

**Сделано:**

- `UsageLoggingModule` — `AiUsageLogRepository`, `AiUsageLogService`.
- Cost estimate: `AI_PRICE_INPUT_PER_1K`, `AI_PRICE_OUTPUT_PER_1K`.
- Лог каждого OpenAI вызова (success/invalid_response) с correlation id в `operation_type`.
- GraphQL `aiUsageCostSummary(days)`.

**Проверки:** `npm run test -- ai-usage` · `npm run migrate` · OK
