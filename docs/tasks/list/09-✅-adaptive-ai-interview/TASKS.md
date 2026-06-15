# 09 — Adaptive AI Interview Tasks

Overall status: ✅ done (post-MVP fixes 09.14–09.15 applied)

Design source of truth: [`docs/database/schemas/adaptive-ai-interview.md`](../../../database/schemas/adaptive-ai-interview.md)

---

## Post-MVP fixes (2026-06-15)

### TASK-09.14 — Ускорить adaptive submit latency

Status: [x] done  
File:

```txt
subtasks/014-✅-optimize-adaptive-submit-latency.md
```

Goal:

Убрать лишний LLM-вызов planner по умолчанию; template follow-up без ~1.8s OpenAI latency.

---

### TASK-09.15 — Остановить follow-ups при «не знаю»

Status: [x] done  
File:

```txt
subtasks/015-✅-stop-follow-ups-on-decline.md
```

Goal:

При явном отказе кандидата не задавать follow-up; skip AI evaluation и перейти к следующему вопросу.

---

### TASK-09.16 — Streaming AI-сообщений через WebSocket

Status: [x] done  
File:

```txt
subtasks/016-✅-add-ai-message-socket-streaming.md
```

Goal:

Доставлять follow-up и next main question по частям через Socket.IO (OpenAI SSE + chunked template/DB text).

---

## Subtasks

### TASK-09.1 — Зафиксировать adaptive interview design

Status: [x] done  
File:

```txt
subtasks/001-✅-document-adaptive-ai-interview-design.md
```

Goal:

Проверить и финализировать документацию нового flow: controlled adaptive interviewer, compact context, follow-up policy, DB model и границы MVP.

---

### TASK-09.2 — Использовать snapshot checkpoints в AI evaluation

Status: [x] done  
File:

```txt
subtasks/002-✅-use-snapshot-checkpoints-for-evaluation.md
```

Goal:

Исправить evaluation context так, чтобы оценка использовала `interview_question_checkpoints`, а не live question bank.

---

### TASK-09.3 — Добавить SQL schema для adaptive evidence

Status: [x] done  
File:

```txt
subtasks/003-✅-add-adaptive-evidence-sql-schema.md
```

Goal:

Создать migration для `interview_checkpoint_states`, `interview_follow_ups`, `interview_question_summaries` и нужной metadata для messages.

---

### TASK-09.4 — Инициализировать checkpoint state для attempt

Status: [x] done  
File:

```txt
subtasks/004-✅-initialize-checkpoint-state.md
```

Goal:

При старте/первом ответе attempt создавать checkpoint state из snapshot checkpoints для текущего вопроса.

---

### TASK-09.5 — Добавить compact AI context builder

Status: [x] done  
File:

```txt
subtasks/005-✅-add-compact-ai-context-builder.md
```

Goal:

Собирать bounded context packet по текущему вопросу без full interview transcript: question, checkpoints, latest answer, state, snippets, local turns.

---

### TASK-09.6 — Добавить per-turn checkpoint evaluator

Status: [x] done  
File:

```txt
subtasks/006-✅-add-per-turn-checkpoint-evaluator.md
```

Goal:

Добавить AI service/prompt/schema, который оценивает текущий ответ по checkpoints и обновляет `interview_checkpoint_states`.

---

### TASK-09.7 — Добавить follow-up planner и policy limits

Status: [x] done  
File:

```txt
subtasks/007-✅-add-follow-up-planner-policy.md
```

Goal:

Добавить backend policy и AI planner для выбора missing/unclear checkpoint и генерации follow-up с жёсткими лимитами.

---

### TASK-09.8 — Обновить public interview submit flow

Status: [x] done  
File:

```txt
subtasks/008-✅-update-public-submit-flow.md
```

Goal:

После ответа кандидата возвращать follow-up или next main question в зависимости от checkpoint state и policy.

---

### TASK-09.9 — Добавить realtime WebSocket channel

Status: [x] done  
File:

```txt
subtasks/009-✅-add-realtime-socket-channel.md
```

Goal:

Добавить WebSocket gateway/events для плавного frontend UX: AI analyzing state, follow-up planned, message appended, reconnect/resync.

---

### TASK-09.10 — Обновить frontend UX для follow-ups

Status: [x] done  
File:

```txt
subtasks/010-✅-add-follow-up-frontend-ux.md
```

Goal:

Показать кандидату follow-up как уточняющий вопрос внутри текущего main question, не ломая transcript и progress UI.

---

### TASK-09.11 — Перестроить final evaluation на evidence summaries

Status: [x] done  
File:

```txt
subtasks/011-✅-use-evidence-for-final-evaluation.md
```

Goal:

Сделать final evaluation primary input из checkpoint states/question summaries, а full transcript использовать только как fallback/manual review context.

---

### TASK-09.12 — Добавить fallback, usage logs и observability

Status: [x] done  
File:

```txt
subtasks/012-✅-add-adaptive-ai-fallbacks-observability.md
```

Goal:

Обработать AI timeout/invalid JSON/provider errors, логировать usage/correlation id, не блокировать завершение интервью.

---

### TASK-09.13 — Покрыть adaptive flow тестами и smoke-check

Status: [x] done  
File:

```txt
subtasks/013-✅-add-adaptive-flow-tests-smoke.md
```

Goal:

Проверить DB, services, GraphQL/public flow и end-to-end сценарий: main answer → follow-up → evidence update → next question → final evaluation.

---

## Completion rule

Блок `09-✅-adaptive-ai-interview` completed — subtasks `09.1`–`09.13` done; post-MVP fixes `09.14`–`09.15` applied 2026-06-15.
