# ⬜ TASK-10.5 — Логи интеграционных отправок

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сделать аудит отправок в ATS: статусы попыток, response code, latency, error message и correlation id для диагностики.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `10-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Логи интеграционных отправок» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/migrations/0xx_create_ats_integration_logs.sql`
- `backend/src/modules/integrations/ats/entities/ats-integration-log.entity.ts`
- `backend/src/modules/integrations/ats/repositories/ats-integration-log.repository.ts`
- `backend/src/modules/integrations/ats/services/ats-log.service.ts`
- `backend/src/modules/integrations/ats/graphql/ats-integration-log.resolver.ts`

## Requirements

1. Логируется каждая попытка отправки, включая retry.
2. Хранятся request метаданные без чувствительных данных.
3. Статусы: `pending`, `success`, `failed`, `dead_letter`.
4. Фильтрация логов по company, interview, status, date range.
5. Retention policy: архив или автоочистка старых записей.

## Step-by-step Plan

1. Создать миграцию таблицы `ats_integration_logs` с индексами.
2. Добавить сервис записи логов до и после HTTP-вызова.
3. Записывать correlation id для сквозной трассировки.
4. Добавить GraphQL query для списка логов в dashboard.
5. Реализовать маскирование секретов и токенов в payload snapshot.

## Acceptance Criteria

- История отправок доступна для расследования инцидентов.
- Логи содержат достаточный контекст без утечки секретов.
- Фильтрация по interview/status работает корректно.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- ats-integration-log
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
