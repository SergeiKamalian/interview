# ⬜ TASK-12.3 — Экспорт результатов в JSON

Status: [ ] todo  
Priority: Medium  
Parent block: `12-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить JSON-экспорт результата интервью в стабильном формате для API-клиентов и ручной передачи в ATS.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `12-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Экспорт результатов в JSON» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/src/modules/integrations/ats/serializers/interview-result-json.serializer.ts`
- `backend/src/modules/integrations/ats/controllers/interview-export.controller.ts`
- `backend/src/modules/integrations/ats/dto/interview-export-json.dto.ts`
- `backend/src/modules/integrations/ats/__tests__/json-export.spec.ts`

## Requirements

1. Формат версионируется полем `schema_version`.
2. JSON содержит метаданные интервью и агрегированную оценку.
3. Даты в ISO-8601 UTC.
4. PII поля проходят минимизацию/маскирование по политике компании.
5. Content-Type: `application/json; charset=utf-8`.

## Step-by-step Plan

1. Реализовать serializer с детерминированным набором полей.
2. Добавить endpoint `GET /integrations/ats/interviews/:id/export.json`.
3. Проверить права доступа: только recruiter/admin своей компании.
4. Покрыть unit-тестами структуру и обязательные поля.
5. Задокументировать пример payload в `docs/api/ats-export-json.md`.

## Acceptance Criteria

- JSON экспорт доступен по защищённому endpoint.
- Структура стабильна и соответствует контракту.
- Данные корректно сериализуются для завершённого интервью.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- json-export
curl -I http://localhost:3000/integrations/ats/interviews/<id>/export.json
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
