# ⬜ TASK-11.6 — Retry-механизм для ATS отправок

Status: [ ] todo  
Priority: High  
Parent block: `11-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить устойчивый retry для неуспешных отправок в ATS с backoff, лимитом попыток и dead-letter состоянием.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `11-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Retry-механизм для ATS отправок» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/src/modules/integrations/ats/queue/ats-dispatch.queue.ts`
- `backend/src/modules/integrations/ats/workers/ats-dispatch.worker.ts`
- `backend/src/modules/integrations/ats/config/retry-policy.config.ts`
- `backend/src/modules/integrations/ats/services/ats-retry.service.ts`
- `backend/src/modules/integrations/ats/__tests__/retry-policy.spec.ts`

## Requirements

1. Retry только для retryable ошибок (network timeout, 429, 5xx).
2. Backoff: экспоненциальный с jitter.
3. Максимум попыток задаётся env-конфигом.
4. После исчерпания попыток запись помечается `dead_letter`.
5. Повторный запуск вручную возможен из dashboard/API.

## Step-by-step Plan

1. Подключить очередь job-ов dispatch (BullMQ или аналог).
2. Определить retry policy и классификацию ошибок.
3. Реализовать worker с обновлением статуса каждой попытки.
4. Добавить сервис ручного requeue для dead-letter кейсов.
5. Покрыть тестами сценарии успешного recovery и полного fail.

## Acceptance Criteria

- Временные ошибки автоматически ретраятся и часто восстанавливаются.
- Нерешаемые ошибки переходят в `dead_letter` после лимита.
- Retry-поведение наблюдаемо через integration logs.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- retry-policy
cd backend && npm run test:e2e -- ats-retry-flow
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
