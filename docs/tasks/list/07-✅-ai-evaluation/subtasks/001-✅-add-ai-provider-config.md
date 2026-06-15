# ✅ TASK-07.1 — Конфигурация AI-провайдера

Status: [x] done  
Priority: High  
Parent block: `07-⬜-ai-evaluation`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить модуль конфигурации **OpenAI**-провайдера (`AI_PROVIDER=openai`, Chat Completions API) с валидацией env и typed access для сервисов оценки.

## Context

После блока 05 уже существует interview flow и ответы кандидата. В блоке 07 backend вызывает OpenAI Chat Completions, передает контекст вопроса из question bank, получает строго структурированный JSON, сохраняет результаты в MySQL и отдает данные в dashboard блок 08.

Эта подзадача — часть блока `07-⬜-ai-evaluation` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Конфигурация AI-провайдера» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- UI отрисовка аналитики и отчетов (блок 08).
- Voice/video pipeline и ASR/TTS (блок 09).
- Fine-tuning модели и хранение dataset для обучения.
- Внешние BI-интеграции и экспорт в сторонние системы.

## Files / Folders Allowed

- `backend/src/common/config/ai.schema.ts`
- `backend/src/modules/ai-provider/ai-provider.module.ts`
- `backend/src/modules/ai-provider/ai-provider.config.ts`
- `backend/src/modules/ai-provider/ai-provider.service.ts`
- `backend/.env.example`
- `backend/README.md`

## Requirements

1. Обязательные env: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL_EVALUATION`, `AI_TIMEOUT_MS`.
2. Опциональные env: `AI_BASE_URL`, `AI_MAX_RETRIES`, `AI_TEMPERATURE`.
3. Joi-валидация env при старте приложения.
4. Сервис возвращает нормализованный client config для downstream модулей.
5. Секреты не логируются и не возвращаются в GraphQL errors.
6. Запрещено подключение Prisma/ORM; доступ к данным только через существующий `DatabaseService`.

## Step-by-step Plan

1. Добавить Joi schema для AI переменных в config слой.
2. Создать `AiProviderModule` и `AiProviderService` с методами `createChatCompletion`/`evaluateJson`.
3. Реализовать timeout/retry policy на уровне HTTP клиента.
4. Обновить `.env.example` и backend README.
5. Проверить, что при отсутствии `AI_API_KEY` приложение не стартует.

## Acceptance Criteria

- Конфиг AI-провайдера валидируется на bootstrap.
- Сервис предоставляет единый интерфейс вызова модели.
- Секреты не попадают в логи и ошибки.

## Checks

```bash
cd backend && npm run build
cd backend && npm run lint
cd backend && AI_PROVIDER=openai AI_API_KEY=missing npm run start:dev 2>&1 | rg "AI_API_KEY|validation"
```

## Completion Notes

**Сделано:**

- `ai.schema.ts` — Joi-валидация (`AI_PROVIDER` openai|compatible, `AI_API_KEY` min 8 + invalid `missing`), `registerAs('ai')`, типы `AiConfig` / `AiProviderClientConfig`.
- `AiProviderModule` (global) — `AiProviderConfig`, `AiProviderService` с `createChatCompletion`, `evaluateJson`, `getClientConfig`.
- HTTP через `fetch` + `AbortSignal.timeout`, retry на 429/5xx с exponential backoff.
- Ошибки наружу — generic `ServiceUnavailableException`, без API key в логах.
- Подключено в `AppConfigModule` (concat schema) и `AppModule`.
- Обновлены `backend/.env.example`, корневой `.env.example`, `backend/README.md`, локальные `.env`.

**Проверки:**

```bash
cd backend && npm run build   # OK
cd backend && npm run lint    # OK
AI_API_KEY=missing npm run start  # Config validation error: AI_API_KEY invalid / min 8
```

**Follow-ups:** TASK-07.2 ✅ — prompts; провайдер зафиксирован как **OpenAI** (`gpt-4o-mini`); ключ только в `backend/.env`.
