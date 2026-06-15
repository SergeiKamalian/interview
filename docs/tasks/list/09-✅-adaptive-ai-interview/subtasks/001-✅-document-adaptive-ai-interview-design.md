# TASK-09.1 — Зафиксировать adaptive interview design

Status: [x] done

## Goal

Финализировать документацию нового controlled adaptive AI interview flow до начала кода.

## Context

Текущий flow работает как questionnaire: кандидат отвечает, backend сразу отдаёт следующий заранее выбранный вопрос, AI evaluation запускается после completion. Новый flow должен добавить live checkpoint-based follow-ups во время интервью.

## Scope

- Проверить `docs/database/schemas/adaptive-ai-interview.md`.
- Проверить `docs/tasks/list/09-🟡-adaptive-ai-interview/README.md`.
- При необходимости уточнить flow, термины, лимиты и DB model.
- Убедиться, что документация явно запрещает свободный AI-dialog без checkpoints.

## Requirements

- AI не источник правды.
- Source of truth для live interview — `interview_question_checkpoints` snapshot.
- Token-saving context должен быть описан явно.
- Должны быть описаны fallback rules при AI timeout/invalid response.
- Должны быть описаны limits:
  - max follow-ups per question;
  - max follow-ups per checkpoint;
  - policy перехода к следующему question.

## Verification

- Прочитать итоговые docs и убедиться, что следующий subtask может реализовывать schema без дополнительных вопросов.
- Проверить, что `TASKS.md` блока ссылается на актуальные subtask files.

## Completion Notes

### Какие docs были уточнены

- `docs/database/schemas/adaptive-ai-interview.md` — основные дополнения:
  - integration с `07-ai-evaluation` (live states vs final summaries);
  - feature flag и env defaults;
  - state machine вопроса и policy complete/follow-up;
  - follow-up eligibility/priority (backend выбирает checkpoint, AI только формулирует);
  - fallback matrix;
  - MVP decision для `interview_messages` columns;
  - GraphQL contract (`submitInterviewAnswer`, `interviewSession`);
  - JSON contracts для per-turn evaluator, follow-up planner, question summary;
  - Socket.IO transport (`/interview` namespace).
- `docs/tasks/list/09-🟡-adaptive-ai-interview/README.md` — ссылки на design doc, env/feature flag, уточнение split GraphQL/WebSocket.
- `docs/tasks/list/09-🟡-adaptive-ai-interview/TASKS.md` — link на design doc, TASK-09.1 marked done.

### Какие решения зафиксированы

- Snapshot checkpoints only; live question bank запрещён для adaptive/evaluation context.
- Max 3 follow-ups/question, max 1/checkpoint (env-overridable).
- Backend policy выбирает eligible checkpoint; AI planner не выбирает тему свободно.
- `ADAPTIVE_INTERVIEW_ENABLED=false` сохраняет legacy flow до frontend subtask.
- Message metadata: columns on `interview_messages` in migration `013`.
- WebSocket = Socket.IO events only; GraphQL = commands/snapshots; MySQL = source of truth.
- Final evaluation primary input = `interview_question_summaries` + `interview_checkpoint_states`.

### Какие проверки выполнены

- Прочитаны `PROJECT.md`, `DECISIONS.md`, related schema docs (`question-bank`, `interview-core`, `ai-evaluation`).
- Сверка с текущим кодом: `EvaluationContextService` действительно грузит checkpoints из question bank (`sourceQuestionId`) — зафиксировано как проблема для TASK-09.2.
- Checklist покрытия следующих subtasks:
  - 09.2 snapshot checkpoints — documented + known bug in subtask file;
  - 09.3 SQL schema — tables, indexes, message columns in design doc;
  - 09.4 init checkpoint state — implied by state machine + tables;
  - 09.5 compact context — context packet + `ADAPTIVE_LOCAL_TURN_LIMIT`;
  - 09.6 per-turn evaluator — JSON contract + validation rules;
  - 09.7 follow-up planner — policy split + priority + template fallback;
  - 09.8 public submit flow — GraphQL payload + feature flag;
  - 09.9 WebSocket — transport, events, reconnect in design doc + subtask 009;
  - 09.10 frontend UX — session snapshot fields documented;
  - 09.11 final evaluation — integration table + summaries;
  - 09.12 fallbacks — fallback matrix + operation types;
  - 09.13 smoke — verification requirements in design doc.
- Runtime code не менялся (scope 09.1).
