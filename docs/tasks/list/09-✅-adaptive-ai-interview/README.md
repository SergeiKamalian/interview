# 09-🟡-adaptive-ai-interview — Adaptive AI interviewer

## Цель блока

Перевести text interview из режима “задали вопрос → приняли ответ → перешли дальше” в controlled adaptive AI interview:

```txt
main question
→ candidate answer
→ checkpoint evaluation по snapshot criteria
→ optional follow-up по missing/unclear checkpoint
→ обновление evidence
→ next main question
```

AI должен помогать добирать evidence по нашим checkpoints во время интервью, но не должен сам придумывать критерии, менять max score или уходить в свободный разговор.

## Контекст текущей реализации

Сейчас во время public interview backend:

1. Показывает заранее выбранный вопрос из `interview_questions`.
2. Сохраняет ответ кандидата в `interview_messages`.
3. Сразу отдаёт следующий вопрос.
4. После завершения attempt запускает AI evaluation.

Это работает как questionnaire + post-evaluation. Новый блок добавляет live/adaptive слой между пунктами 2 и 3.

## Главное продуктовое изменение

Если вопрос `Что такое useEffect в React?` имеет 5 checkpoints, а кандидат ответил только на 2, система не должна сразу переходить дальше. Она должна:

1. Оценить покрытие checkpoints.
2. Понять, какие checkpoints `missed` или `unclear`.
3. Выбрать самый важный checkpoint для уточнения.
4. Сформулировать короткий follow-up.
5. Принять ответ на follow-up.
6. Обновить checkpoint evidence.
7. Перейти дальше, когда evidence достаточно или лимиты исчерпаны.

## Token-saving архитектура

Нельзя отправлять AI весь transcript интервью на каждый ответ.

Каждый AI call получает только compact context текущего вопроса:

- `interview_question` текущего main question;
- snapshot checkpoints из `interview_question_checkpoints`;
- последний ответ кандидата;
- компактное checkpoint state по текущему вопросу;
- короткие evidence snippets;
- последние 1-3 turns только внутри текущего вопроса, если нужны;
- лимиты follow-up.

Final evaluation использует per-question summaries/evidence, а не весь transcript по умолчанию.

## Что входит в этот блок

- Исправить AI evaluation context: использовать snapshot checkpoints, а не live question bank.
- Добавить DB design + migrations для checkpoint state, follow-ups и per-question summaries.
- Добавить adaptive policy: лимиты follow-up, выбор checkpoint, fallback при timeout.
- Разделить AI calls:
  - per-turn checkpoint evaluator;
  - follow-up planner.
- Обновить public interview flow: после ответа кандидата может вернуться follow-up, а не следующий main question.
- Добавить compact context builder, который не отправляет всю историю.
- Сохранять evidence/rationale/follow-up history в БД.
- Добавить realtime WebSocket channel для плавного frontend UX: typing/loading states, follow-up events, reconnect/resync.
- Обновить final evaluation, чтобы она могла опираться на collected evidence.
- Добавить frontend UX для follow-up вопросов.
- Добавить tests и smoke-check полного adaptive сценария.

## Что НЕ входит в этот блок

- Voice/video input.
- STT/TTS.
- Realtime streaming ответа AI.
- Свободный AI interviewer без checkpoint constraints.
- Сложный proctoring.
- Многошаговый агент с памятью всего интервью.
- Автоматическая генерация новых критериев оценки.

## Важные архитектурные правила

- Source of truth для оценки текущего интервью — snapshot `interview_question_checkpoints`.
- AI не может возвращать unknown `checkpoint_key`.
- Backend policy решает, можно ли задавать follow-up; AI только формулирует текст по **одному** checkpoint, выбранному backend.
- Максимум follow-ups должен быть ограничен на вопрос и checkpoint (env: см. `docs/database/schemas/adaptive-ai-interview.md`).
- При ошибке AI provider interview не должен ломаться: ставим `needs_manual_review` / `unclear` и продолжаем.
- Все AI calls логируются через usage logging (`evaluate_turn`, `plan_follow_up`, `summarize_question`).
- Token payload должен быть bounded by current question, а не full attempt transcript.
- БД остаётся source of truth; WebSocket не хранит бизнес-состояние, а только доставляет realtime events.
- Все socket events должны быть восстановимы через GraphQL query `interviewSession` после refresh/reconnect.
- `ADAPTIVE_INTERVIEW_ENABLED=false` сохраняет legacy questionnaire flow до готовности frontend.
- Live adaptive tables (`interview_checkpoint_states`, `interview_follow_ups`, `interview_question_summaries`) дополняют `07-ai-evaluation`; final eval читает summaries, не full transcript.

Подробный design: [`docs/database/schemas/adaptive-ai-interview.md`](../../database/schemas/adaptive-ai-interview.md).

Latency design для временного OpenAI server-side state: [`docs/OPENAI_SERVER_STATE.md`](../../../OPENAI_SERVER_STATE.md).

## Realtime frontend через WebSocket

Для плавного UX используем best-practice split:

```txt
GraphQL = commands + snapshots
WebSocket (Socket.IO, namespace /interview) = realtime events
MySQL = source of truth
```

Frontend отправляет answer через GraphQL mutation или socket command только если backend поддерживает idempotency. MVP-рекомендация: оставить submit через GraphQL mutation, а WebSocket использовать для событий:

- `answer.received`;
- `ai.evaluation_started`;
- `ai.follow_up_planned`;
- `message.appended`;
- `question.completed`;
- `attempt.completed`;
- `evaluation.ready`;
- `adaptive.error_recovered`.

Socket подключается к room:

```txt
attempt:{attemptId}
```

Auth/identity для public candidate flow:

- `publicToken`;
- `attemptId`;
- короткий `sessionNonce` или signed session token, если будет добавлен.

Reconnect policy:

1. Client reconnects to socket.
2. Client joins `attempt:{attemptId}`.
3. Client immediately calls GraphQL `interviewSession(publicToken, attemptId)`.
4. UI rebuilds state from snapshot.
5. Later socket events only incrementally update UI.

Event rules:

- emit только после успешного DB commit;
- event содержит `attemptId`, `interviewQuestionId`, `messageId`/`followUpId`, `sequenceOrder`, `eventType`;
- client должен быть idempotent: если message уже есть, не дублировать;
- socket event не должен содержать secrets, ideal answer или internal checkpoint details для кандидата.

## Основной пример

Question:

```txt
Что такое useEffect в React?
```

Checkpoints:

- `side_effects`
- `dependency_array`
- `run_timing`
- `cleanup`
- `example`

Candidate answer:

```txt
useEffect запускается после рендера и используется для запросов.
```

Evaluator result:

- `side_effects`: `covered`
- `run_timing`: `covered`
- `example`: `partial`
- `dependency_array`: `missed`
- `cleanup`: `missed`

Follow-up planner chooses:

```txt
А что делает dependency array в useEffect?
```

After answer:

- checkpoint state updates;
- evidence snippet stored;
- if limit remains, maybe ask `cleanup`;
- otherwise move to next main question.

## Зависимости от предыдущих блоков

- `05-✅-question-bank`: source questions, ideal answers, checkpoints, weights.
- `06-✅-interview-core`: public interview flow, attempts, messages, snapshot questions.
- `07-✅-ai-evaluation`: AI provider, structured JSON validation, usage logging, guardrails.
- `08-✅-dashboard-analytics`: report UI and checkpoint result display.
- `docs/database/schemas/adaptive-ai-interview.md`: target DB design for this block.

## Ожидаемый результат после завершения блока

Кандидат проходит не статичный опрос, а controlled adaptive interview. Система задаёт уточнения только по незакрытым/неясным checkpoints, экономит tokens через compact context, сохраняет evidence в БД и строит final evaluation на объяснимой базе данных, а не на свободном впечатлении AI.

## Post-MVP fixes (2026-06-15)

- **09.14** — planner по умолчанию без LLM (template follow-up, ~1.8s быстрее на submit).
- **09.15** — при «не знаю» skip follow-ups и AI evaluate, переход к следующему вопросу.
- **09.16** — streaming AI-сообщений (follow-up / next question) через WebSocket.
