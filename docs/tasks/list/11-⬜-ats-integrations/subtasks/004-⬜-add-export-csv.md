# ⬜ TASK-11.4 — Экспорт результатов в CSV

Status: [ ] todo  
Priority: Medium  
Parent block: `11-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить CSV-экспорт результатов интервью для HR-аналитики, отчётности и загрузки в legacy ATS.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `11-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Экспорт результатов в CSV» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/src/modules/integrations/ats/serializers/interview-result-csv.serializer.ts`
- `backend/src/modules/integrations/ats/controllers/interview-export.controller.ts`
- `backend/src/modules/integrations/ats/dto/interview-export-csv-row.dto.ts`
- `backend/src/modules/integrations/ats/__tests__/csv-export.spec.ts`

## Requirements

1. CSV в UTF-8 с заголовком колонок.
2. Разделитель `,` и корректное экранирование кавычек.
3. Поддержка многострочных текстовых ответов кандидата.
4. Content-Disposition с читаемым filename.
5. Единый порядок колонок между экспортами.

## Step-by-step Plan

1. Реализовать CSV serializer через потоковую генерацию.
2. Добавить endpoint `GET /integrations/ats/interviews/:id/export.csv`.
3. Согласовать набор колонок с рекрутинг-командой (score, verdict, started_at, completed_at).
4. Покрыть тестами edge-cases с запятыми и переносами строк.
5. Проверить открытие файла в Google Sheets/Excel.

## Acceptance Criteria

- CSV скачивается и корректно открывается в табличных редакторах.
- Колонки и порядок фиксированы и задокументированы.
- Спецсимволы и многострочные поля сериализуются без поломки формата.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- csv-export
curl -L http://localhost:3000/integrations/ats/interviews/<id>/export.csv -o /tmp/interview.csv
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
