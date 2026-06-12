# ⬜ TASK-10.7 — Базовый API-адаптер ATS

Status: [ ] todo  
Priority: Medium  
Parent block: `10-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Ввести единый абстрактный слой ATS API adapter для стандартизации HTTP-запросов, auth и преобразования payload.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `10-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Базовый API-адаптер ATS» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/src/modules/integrations/ats/adapters/base-ats.adapter.ts`
- `backend/src/modules/integrations/ats/adapters/webhook-ats.adapter.ts`
- `backend/src/modules/integrations/ats/adapters/factory/ats-adapter.factory.ts`
- `backend/src/modules/integrations/ats/contracts/ats-adapter.interface.ts`
- `backend/src/modules/integrations/ats/__tests__/ats-adapter.spec.ts`

## Requirements

1. Контракт адаптера: `sendInterviewResult(payload, config)`.
2. Поддержка нескольких типов auth: bearer token, static header, signature.
3. Единая нормализация ошибок в доменные коды.
4. Factory выбирает адаптер по `provider_type`.
5. Лёгкое расширение под конкретных провайдеров в будущих блоках.

## Step-by-step Plan

1. Определить интерфейс и базовый абстрактный класс адаптера.
2. Реализовать webhook-адаптер как дефолтный provider.
3. Вынести общую логику HTTP client/headers/timeout.
4. Интегрировать adapter factory в dispatch service.
5. Добавить unit-тесты на формирование заголовков и error mapping.

## Acceptance Criteria

- Dispatch использует adapter abstraction, а не прямой HTTP вызов.
- Добавление нового провайдера не требует изменения core dispatch логики.
- Ошибки адаптера приводятся к единообразному формату.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- ats-adapter
cd backend && npm run lint
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
