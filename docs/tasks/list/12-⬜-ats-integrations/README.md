# 12-⬜-ats-integrations — ATS-интеграции

## Цель блока

Подготовить практичный интеграционный слой с внешними ATS: webhook-конфиг, отправка итогов интервью, экспорт JSON/CSV, логи интеграций, retry-механизм и базовый API-адаптер.

## Контекст

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

## Что входит в этот блок

- Хранение конфигурации webhook endpoint на уровне компании/интеграции.
- Автоматическая отправка финального результата интервью по событию completion.
- Экспорт interview result в JSON для API-интеграций и ручной загрузки.
- Экспорт interview result в CSV для HR-аналитики и legacy ATS.
- Журнал интеграций: request/response, статусы, latency, ошибки.
- Retry-механизм для временных сбоев сети и 5xx ответов.
- Базовый ATS API adapter слой с единым контрактом и auth headers.

## Что НЕ входит в этот блок

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Важные архитектурные решения

- Новый модуль `backend/src/modules/integrations/ats/` с сервисами webhook dispatch.
- Отправка асинхронна через очередь job-ов (Redis/BullMQ) для устойчивости.
- Интеграционные события фиксируются в таблице логов с correlation id.
- Payload строится из `interview`, `candidate`, `evaluation_summary` через mapper.
- Retry policy: экспоненциальный backoff + max attempts + dead-letter status.
- Экспорт JSON/CSV доступен как service-level serializer и REST endpoint для скачивания.

## Зависимости от предыдущих блоков

- Блок `02-⬜-database-design`: design doc `docs/database/schemas/ats-integrations.md` — webhook config, integration logs, delivery retry metadata.
- Блок `06-⬜-interview-core`: сущности interview, candidate token, completion status.
- Блок `07-⬜-ai-evaluation`: финальный score/summary/checkpoints.
- Блок `08-⬜-dashboard-analytics`: интерфейс для повторной отправки и просмотра логов.
- Блок `09-⬜-adaptive-ai-interview`: evidence-based final evaluation и summaries.
- Блок `01-🟡-backend-foundation`: Redis + backend infrastructure и migration runner.

## Ожидаемый результат после завершения блока

После завершения интервью система формирует стандартизированный payload, пытается отправить его в ATS endpoint, логирует каждую попытку, при сбое выполняет retry, а также позволяет получить JSON/CSV экспорт для ручной доставки.
