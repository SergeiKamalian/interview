# OpenAI Server-Side Conversation State для adaptive interview

## Цель

Уменьшить latency adaptive interview за счёт того, что backend не отправляет в OpenAI один и тот же большой prompt на каждый ответ кандидата.

## Обновление: стартовая инициализация чата

При `startPublicInterview` backend теперь может заранее инициализировать OpenAI Responses state для первого вопроса:

```txt
candidate opens public link
→ enters name/email
→ startPublicInterview creates attempt and first main_question
→ backend prewarms OpenAI Responses state for current question
→ frontend shows loading while start mutation is running
→ first candidate answer continues with previous_response_id
```

Зачем:

- первая реальная проверка ответа не тратит время на bootstrap context;
- OpenAI уже получил system prompt, question, reference answer и checkpoint snapshot;
- candidate видит понятный loading на старте, а не задержку после первого ответа;
- если prewarm падает, interview start не ломается: первый ответ выполнит обычный bootstrap fallback.

Текущая реализация хранит prewarm state в Redis, без изменений БД.

Желаемое поведение:

```txt
1. На старте вопроса backend один раз передаёт OpenAI:
   - system instruction;
   - текущий interview question;
   - snapshot checkpoints;
   - scoring rules;
   - формат JSON.

2. На следующих turns backend отправляет только:
   - новый ответ кандидата;
   - компактное состояние score/checkpoints, если нужно.

3. OpenAI продолжает conversation по server-side state:
   - previous_response_id;
   - или conversation object.
```

Важно: это не меняет главный продуктовый принцип. Source of truth остаётся `interview_question_checkpoints`, а AI только сравнивает ответы кандидата с нашими checkpoint-критериями.

---

## Ключевой вывод

Да, OpenAI поддерживает server-side conversation state через Responses API:

- `previous_response_id`;
- `conversation`;
- server-side truncation/compaction.

Но это не означает, что модель "один раз всё прочитала и потом бесплатно помнит".

Реальность:

| Вопрос                                                                | Ответ                                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Можно ли не отправлять весь prompt с backend каждый раз?              | Да, через `previous_response_id` / `conversation`.                |
| Будет ли меньше network payload?                                      | Да.                                                               |
| Будет ли меньше нашего кода для хранения full message history?        | Да.                                                               |
| Будут ли прошлые tokens полностью бесплатными?                        | Нет. OpenAI всё равно учитывает прошлый context как input tokens. |
| Может ли стать быстрее?                                               | Да, за счёт server-side state, prompt caching и меньшего payload. |
| Можно ли полностью избежать повторного "прочтения" контекста моделью? | Нет, LLM inference всё равно строится из context window.          |

---

## Почему обычный Chat Completions не подходит идеально

Текущий backend использует OpenAI-compatible Chat Completions:

```txt
POST /chat/completions
```

Для этого API conversation state stateless:

```txt
request 1: messages=[system, user full context, candidate answer 1]
request 2: messages=[system, user full context, answer 1, assistant 1, answer 2]
request 3: messages=[system, user full context, answer 1, assistant 1, answer 2, assistant 2, answer 3]
```

Модель знает только то, что пришло в текущем request.

Мы уже сделали Redis conversation session:

```txt
adaptive-ai:evaluate:{attemptId}:{interviewQuestionId}
```

Но это всё ещё client-managed history:

- backend хранит историю в Redis;
- backend каждый раз отправляет массив `messages`;
- OpenAI не знает о нашей Redis-сессии;
- network payload и prompt tokens растут по мере turns.

Это лучше, чем заново строить полный prompt на каждый answer, но всё ещё не настоящий server-side state у OpenAI.

---

## Что даёт Responses API

Responses API позволяет связать ответы:

```ts
const first = await openai.responses.create({
  model: "gpt-5.4-nano",
  input: [
    {
      role: "system",
      content: "Strict technical evaluator...",
    },
    {
      role: "user",
      content: "Full bootstrap context: question + checkpoints + scoring rules",
    },
  ],
  store: true,
});

const second = await openai.responses.create({
  model: "gpt-5.4-nano",
  previous_response_id: first.id,
  input: [
    {
      role: "user",
      content: "New candidate answer only...",
    },
  ],
  store: true,
});
```

Backend хранит только:

```json
{
  "openaiResponseId": "resp_...",
  "promptVersion": "conv-2.2.0-combined-v1",
  "attemptId": 5,
  "interviewQuestionId": 10,
  "turnCount": 2
}
```

На следующем ответе candidate backend отправляет:

```json
{
  "previous_response_id": "resp_...",
  "input": "New candidate answer + compact current checkpoint state"
}
```

OpenAI сам подтягивает предыдущую историю по `previous_response_id`.

---

## `previous_response_id` vs `conversation`

Официальная документация OpenAI описывает два server-side варианта:

- `previous_response_id` — цепочка Responses API для threaded continuation;
- `Conversations API` — durable conversation object, который передаётся в Responses API через поле `conversation`.

Ссылка на официальный guide: `https://developers.openai.com/api/docs/guides/conversation-state`

Важное уточнение из docs: даже при `previous_response_id` прошлый context всё равно учитывается как input tokens, но backend не обязан пересылать весь messages массив, а server-side state и prompt caching могут уменьшить latency.

### Вариант A: `previous_response_id`

Подходит для adaptive interview лучше всего.

Схема:

```txt
question starts
→ create first response with full bootstrap
→ save response.id in Redis
→ candidate follow-up answer
→ call responses.create(previous_response_id=lastResponseId, input=new turn)
→ save new response.id
→ question completed
→ delete Redis state
```

Плюсы:

- простой lifecycle;
- state scoped на один `attemptId + interviewQuestionId`;
- легко удалить при закрытии вопроса;
- не нужен долгоживущий OpenAI conversation object на весь interview;
- хорошо соответствует текущей модели: одна AI-сессия на один main question.

Минусы:

- нужна поддержка Responses API в `AiProviderService`;
- нужно хранить `lastResponseId`;
- `store: true` означает server-side хранение response у OpenAI;
- прошлые context tokens всё равно биллятся.

### Вариант B: `conversation`

OpenAI создаёт durable conversation object:

```txt
conversation_id = conv_...
```

Потом каждый `responses.create` получает `conversation`.

Плюсы:

- более "чатовая" модель;
- можно продолжать conversation между сессиями/устройствами;
- OpenAI хранит больше lifecycle state.

Минусы для нашего продукта:

- сложнее чистить;
- conversation может расти долго;
- больше vendor lock-in;
- нужно решать, один conversation на attempt или на question;
- для strict JSON evaluation лишняя сложность.

Решение для MVP:

```txt
Использовать previous_response_id на уровне одного main question.
Подготовить AiProviderService к параметру conversation, но не требовать Conversations API для MVP.
Не использовать durable conversation object на весь interview, пока SDK/runtime support не стабилен в нашем установленном пакете.
```

Причина: установленный `openai` SDK уже стабильно поддерживает Responses API и `previous_response_id`, но текущие typings в проекте не expose `client.conversations.create()`. Поэтому `conversation` оставлен как future-compatible option в AI layer, а production flow остаётся на `previous_response_id`.

---

## Почему не Assistants / Threads

Assistants API тоже хранит server-side thread:

```txt
thread
→ messages
→ run
```

Но для adaptive evaluation это хуже:

- больше lifecycle объектов;
- run может быть медленнее и сложнее;
- сложнее строгий JSON-only режим;
- сложнее тестировать и fallback'ить;
- thread history всё равно попадает в prompt window и биллится;
- больше зависимости от OpenAI-specific abstraction.

Для нашего backend лучше тонкий слой:

```txt
AiProviderService
→ Chat Completions fallback
→ Responses API optional mode
```

---

## Что реально ускорит

### 0. Prewarm Responses state при старте интервью

Реализованный первый шаг:

```txt
startPublicInterview
→ initialize evaluate_turn state for first question
→ save lastResponseId in Redis
→ first submitAnswer uses previous_response_id
```

Ожидаемый эффект:

- меньше latency на первом `submitInterviewAnswer`;
- лучше UX: loading происходит при входе в interview session;
- нет миграций и новых таблиц.

### 1. Убрать второй LLM call

Это уже самый большой выигрыш.

Текущий оптимизированный план:

```txt
evaluate_turn returns:
  - checkpoint_results
  - candidate_disposition
  - suggested_follow_up
```

Если `suggested_follow_up.checkpoint_key` совпадает с backend policy target, `FollowUpPlannerService` не делает отдельный `plan_follow_up` LLM call.

Ожидаемый выигрыш:

```txt
-1.5s ... -3s на turn с follow-up
```

### 2. Server-side state через Responses API

Уменьшает:

- network payload;
- размер request body;
- backend Redis history;
- повторную отправку bootstrap prompt с backend.

Может улучшить:

- prompt caching;
- time-to-first-token;
- latency на длинных prompts.

Не гарантирует:

- нулевую стоимость старого context;
- что модель "не перечитывает" context вообще.

### 3. Prompt caching

OpenAI автоматически кэширует одинаковый prefix prompt.

Требования:

- первые 1024+ tokens должны совпадать;
- static content должен быть в начале;
- dynamic candidate answer должен быть в конце;
- желательно использовать стабильный `prompt_cache_key`, если доступен у выбранного endpoint/model.

Для adaptive interview prefix должен быть:

```txt
system instructions
question text
reference answer
checkpoint list
JSON schema
scoring rules
```

Dynamic suffix:

```txt
latest candidate answer
current checkpoint state
```

Даже если остаёмся на Chat Completions, нужно логировать:

```txt
usage.prompt_tokens_details.cached_tokens
```

---

## Предлагаемая архитектура

### Новые env flags

```env
# Use OpenAI Responses API instead of Chat Completions for adaptive evaluate_turn.
ADAPTIVE_AI_OPENAI_RESPONSES_API=true

# Store OpenAI previous_response_id per attempt/question and send only new turns after bootstrap.
ADAPTIVE_AI_OPENAI_SERVER_STATE=true

# Safety fallback: if Responses API fails, retry once with current Chat Completions path.
ADAPTIVE_AI_OPENAI_SERVER_STATE_FALLBACK=true

# Optional: response state TTL in Redis.
ADAPTIVE_AI_OPENAI_STATE_TTL_SECONDS=86400
```

Можно оставить существующие:

```env
ADAPTIVE_AI_CONVERSATION_SESSION=true
ADAPTIVE_AI_COMBINED_TURN=true
ADAPTIVE_AI_CONVERSATION_TTL_SECONDS=86400
```

Разница:

| Flag                               | Что делает                                                       |
| ---------------------------------- | ---------------------------------------------------------------- |
| `ADAPTIVE_AI_CONVERSATION_SESSION` | Хранит full messages в Redis и отправляет их в Chat Completions. |
| `ADAPTIVE_AI_OPENAI_SERVER_STATE`  | Хранит только `previous_response_id`; context хранится у OpenAI. |
| `ADAPTIVE_AI_COMBINED_TURN`        | Один call возвращает evaluation + suggested follow-up.           |

### Redis state

Ключ:

```txt
adaptive-ai:openai-response:evaluate:{attemptId}:{interviewQuestionId}
```

Значение:

```json
{
  "provider": "openai",
  "api": "responses",
  "model": "gpt-5.4-nano",
  "promptVersion": "conv-2.2.0-combined-v1",
  "lastResponseId": "resp_...",
  "attemptId": 5,
  "interviewQuestionId": 10,
  "turnCount": 2,
  "createdAt": "2026-06-15T13:00:00.000Z",
  "updatedAt": "2026-06-15T13:03:00.000Z"
}
```

State invalidation:

- prompt version changed → ignore old state and bootstrap again;
- model changed → ignore old state and bootstrap again;
- question completed → delete state;
- provider error / missing response id → fallback and optionally delete state;
- Redis expired → bootstrap again.

### Backend flow

```txt
AdaptiveInterviewSubmitService.submitAnswer
→ save candidate message
→ buildContextPacket once
→ PerTurnCheckpointEvaluatorService.evaluateTurnAndPersist
   → if ADAPTIVE_AI_OPENAI_SERVER_STATE=true
      → OpenAiResponseStateService.loadState()
      → if no state:
          responses.create(input=bootstrap + first turn, store=true)
        else:
          responses.create(previous_response_id=state.lastResponseId, input=new turn, store=true)
      → validate JSON
      → save new response.id
   → else:
      current Chat Completions / Redis message history path
→ persist checkpoint states
→ FollowUpPlannerService.planFollowUp
   → reuse suggested_follow_up if valid
   → fallback to planner/template if not valid
```

---

## Prompt strategy

### Bootstrap input

Bootstrap должен быть максимально стабильным.

Содержит:

- evaluator system instruction;
- JSON response schema;
- main question;
- reference answer;
- checkpoints;
- strict scoring rules;
- instruction: return evaluation for every checkpoint;
- instruction: suggested follow-up is optional and must align to one checkpoint.

Пример:

```txt
You are a strict technical interview evaluator...

Question:
What are generics in TypeScript?

Reference answer:
...

Checkpoints:
1. key=type_parameter
   expected=...
   max_score=1
...

For every later turn, evaluate cumulatively.
Never decrease scores.
Return JSON only.
```

### Turn input

Следующие turns должны быть короткими:

```txt
New candidate answer:
"Я использовал generic в таблице, чтобы типизировать строки данных..."

Current checkpoint states:
- type_parameter: partial 0.5/1
- reusability: covered 1/1
- type_safety: missed 0/1
- constraints: missed 0/1

Return updated JSON for all checkpoints and suggested_follow_up if needed.
```

Почему всё равно передаём `current checkpoint states`:

- БД остаётся source of truth;
- OpenAI state может потеряться/быть truncated;
- scoring must never decrease;
- evaluator должен знать уже persisted score;
- это компактный блок, не full history.

---

## Response JSON

Responses API должен возвращать тот же logical payload, что текущий evaluator:

```json
{
  "candidate_disposition": "engaged",
  "checkpoint_results": [
    {
      "checkpoint_key": "type_parameter",
      "status": "partial",
      "score_awarded": 0.5,
      "confidence": 0.72,
      "evidence_summary": "Кандидат сказал, что generic позволяет типизировать строки таблицы.",
      "rationale": "Ответ частично описывает type parameter через пример таблицы."
    }
  ],
  "suggested_follow_up": {
    "checkpoint_key": "constraints",
    "follow_up_question": "Понял, с таблицей пример хороший. А как бы вы ограничили generic, если объект обязан иметь, например, поле id?",
    "reason": "constraints ещё не раскрыты"
  }
}
```

Validator остаётся локальным:

- проверяет JSON parse;
- проверяет known checkpoint keys;
- проверяет `score_awarded <= max_score`;
- проверяет count of checkpoint results;
- отбрасывает unknown fields;
- не доверяет AI как source of truth.

---

## Fallback strategy

Responses API не должен ломать интервью.

Fallback order:

```txt
1. Try Responses API server state.
2. If provider error / invalid response:
   - mark state as suspect or delete Redis state;
   - retry once with existing Chat Completions path;
3. If still invalid:
   - mark checkpoints needs_manual_review;
   - continue interview using template follow-up or next question.
```

Важно:

- fallback не должен делать бесконечные retries;
- нельзя дважды применять score к одному candidate message;
- `candidateMessageId` остаётся idempotency anchor;
- `checkpoint_state_repository.applyTurnEvaluationResults` продолжает merge-score.

---

## Observability

Нужно логировать отдельно:

### Usage log

`ai_usage_logs.operation_type` можно оставить:

```txt
evaluate_turn
```

В `rawResponse` / debug meta добавить:

```json
{
  "api": "responses",
  "serverState": true,
  "conversationMode": true,
  "hadPreviousResponseId": true,
  "responseId": "resp_...",
  "promptVersion": "conv-2.2.0-combined-v1"
}
```

### Debug log

При `ADAPTIVE_AI_DEBUG=true`:

```txt
[adaptive-ai-debug] openai.responses.request
[adaptive-ai-debug] openai.responses.response
[adaptive-ai-debug] openai.server_state.loaded
[adaptive-ai-debug] openai.server_state.saved
[adaptive-ai-debug] openai.server_state.bootstrap
[adaptive-ai-debug] openai.server_state.fallback
```

### Metrics to compare

До/после:

| Metric                     | Где смотреть                               |
| -------------------------- | ------------------------------------------ |
| `submit_answer.total`      | adaptive debug phase                       |
| `evaluate_turn.ai_total`   | adaptive debug phase                       |
| `ai_usage_logs.latency_ms` | MySQL                                      |
| `prompt_tokens`            | `ai_usage_logs`                            |
| `cached_tokens`            | OpenAI usage details, если endpoint отдаёт |
| second LLM call skipped    | `plan_follow_up.combined_turn_reuse`       |

---

## Security / privacy

Server-side state у OpenAI означает, что часть interview context хранится на стороне provider.

Нужно явно учитывать:

- `store: true` нужен для `previous_response_id`;
- хранить OpenAI response id в Redis, а не в MySQL, чтобы state был временным;
- TTL должен быть коротким (`86400` seconds или меньше);
- state удаляется при завершении question;
- не отправлять в bootstrap лишние персональные данные кандидата;
- bootstrap должен содержать только технический question context.

Не отправлять:

- email кандидата;
- phone;
- LinkedIn/GitHub;
- company private notes, если они не нужны для оценки;
- весь transcript interview.

---

## Почему state scoped на question, а не на весь interview

Один OpenAI state на весь interview кажется похожим на живой чат, но для оценки хуже.

Проблемы full-interview state:

- context быстро растёт;
- risk cross-question leakage;
- evaluator может смешивать checkpoints разных questions;
- сложнее сохранить source-of-truth boundary;
- при truncation можно потерять важные checkpoints;
- final score должен опираться на persisted DB evidence, а не provider memory.

Правильная граница:

```txt
OpenAI server state = one main question and its follow-ups.
MySQL evidence summaries = durable memory across full interview.
Final evaluation = summaries/checkpoint states, not OpenAI chat memory.
```

---

## Implementation plan

### Step 1 — Config

Добавить flags:

```ts
isAdaptiveAiOpenAiResponsesApiEnabled();
isAdaptiveAiOpenAiServerStateEnabled();
isAdaptiveAiOpenAiServerStateFallbackEnabled();
getAdaptiveAiOpenAiStateTtlSeconds();
```

Files:

- `backend/src/modules/adaptive-interview/config/adaptive-interview-context.config.ts`;
- `.env.example`;
- `backend/.env.example`;
- локально `.env` / `backend/.env`.

### Step 2 — AiProviderService support

Добавить методы:

```ts
createResponse(input);
evaluateJsonWithResponseState(input);
```

Endpoint:

```txt
POST /responses
```

Request modes:

```ts
// bootstrap
{
  model,
  input,
  store: true,
  text: { format: { type: 'json_object' } } // если поддерживается выбранной моделью/API
}

// continuation
{
  model,
  previous_response_id,
  input,
  store: true,
  text: { format: { type: 'json_object' } }
}
```

Если JSON mode в Responses API отличается для текущей модели, adapter должен изолировать различия внутри `AiProviderService`.

### Step 3 — Redis state service

Новый service:

```txt
AdaptiveOpenAiResponseStateService
```

Методы:

```ts
loadEvaluateState(attemptId, interviewQuestionId, promptVersion, model)
saveEvaluateState(...)
clearEvaluateState(...)
```

State type:

```ts
type AdaptiveOpenAiResponseState = {
  provider: "openai";
  api: "responses";
  model: string;
  promptVersion: string;
  lastResponseId: string;
  attemptId: number;
  interviewQuestionId: number;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
};
```

### Step 4 — Evaluator integration

В `PerTurnCheckpointEvaluatorService`:

```txt
if ADAPTIVE_AI_OPENAI_SERVER_STATE:
  evaluateTurnWithOpenAiServerState()
else if ADAPTIVE_AI_CONVERSATION_SESSION:
  evaluateTurnWithRedisConversation()
else:
  evaluateTurnStateless()
```

Priority:

```txt
OpenAI server state > Redis conversation session > stateless Chat Completions
```

### Step 5 — Clear state

В `AdaptiveInterviewSubmitService.completeCurrentQuestion`:

```txt
clear Redis conversation session
clear OpenAI response state
```

Также очищать state при:

- full question decline;
- attempt completed;
- provider state mismatch.

### Step 6 — Tests

Unit tests:

- first turn bootstraps without `previous_response_id`;
- second turn uses saved `previous_response_id`;
- prompt version mismatch bootstraps again;
- provider error falls back to Chat Completions;
- invalid JSON falls back / marks manual review;
- question complete clears state;
- suggested follow-up still skips planner LLM.

Integration/smoke:

- run one interview question with 2 follow-ups;
- assert only first call includes bootstrap;
- assert subsequent calls include only new turn input;
- assert `submit_answer.total` decreases vs baseline.

---

## Rollout plan

### Local only

```env
ADAPTIVE_AI_OPENAI_RESPONSES_API=true
ADAPTIVE_AI_OPENAI_SERVER_STATE=true
ADAPTIVE_AI_OPENAI_SERVER_STATE_FALLBACK=true
ADAPTIVE_AI_DEBUG=true
```

Проверить:

- Redis state создаётся;
- `lastResponseId` обновляется;
- follow-up приходит;
- evaluation persists;
- final score строится.

### A/B

Сравнить 3 режима:

| Mode                | Flags                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| Baseline stateless  | `ADAPTIVE_AI_CONVERSATION_SESSION=false`, `ADAPTIVE_AI_OPENAI_SERVER_STATE=false` |
| Redis conversation  | `ADAPTIVE_AI_CONVERSATION_SESSION=true`, `ADAPTIVE_AI_OPENAI_SERVER_STATE=false`  |
| OpenAI server state | `ADAPTIVE_AI_OPENAI_SERVER_STATE=true`                                            |

Собрать:

- avg `evaluate_turn.ai_total`;
- avg `submit_answer.total`;
- prompt tokens;
- cached tokens, если доступны;
- invalid response rate;
- provider error rate.

### Production readiness

Не включать без:

- fallback;
- debug logs;
- metrics;
- TTL cleanup;
- tests;
- clear privacy note.

---

## Expected impact

| Improvement                      | Latency impact                   | Token/cost impact                          | Risk                          |
| -------------------------------- | -------------------------------- | ------------------------------------------ | ----------------------------- |
| Combined `evaluate + follow-up`  | High: removes second LLM call    | Medium                                     | JSON schema more complex      |
| Redis conversation session       | Medium                           | Medium via shorter dynamic prompts / cache | Still sends full messages     |
| Responses `previous_response_id` | Medium/High on payload and cache | Low/Medium, old context still billed       | Provider lock-in / store=true |
| Prompt caching                   | Medium/High if prefix stable     | High on cached prefix                      | Cache hit not guaranteed      |
| Async submit                     | Very high perceived UX           | None directly                              | Bigger architecture change    |

Main expectation:

```txt
First answer for question:
  still has bootstrap cost.

Follow-up answers:
  no full bootstrap from backend;
  no second planner LLM call;
  smaller request payload;
  better prompt cache chance.
```

---

## Decision

For this project, recommended next implementation:

```txt
Implement OpenAI Responses API previous_response_id for adaptive evaluate_turn,
scoped per attemptId + interviewQuestionId,
behind env flags,
with fallback to current Chat Completions path.
```

Do not use Assistants/Threads for this part.

Do not create one long OpenAI conversation for the whole interview.

Do not move source of truth from MySQL/checkpoints into OpenAI memory.

---

## References

- OpenAI Conversation State: `https://developers.openai.com/api/docs/guides/conversation-state`
- OpenAI Prompt Caching: `https://developers.openai.com/api/docs/guides/prompt-caching`
- OpenAI Assistants Threads: `https://developers.openai.com/api/docs/assistants/deep-dive`
