# ⬜ TASK-10.1 — Конфигурация webhook для ATS

Status: [ ] todo  
Priority: High  
Parent block: `10-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Добавить хранение и валидацию webhook-конфигурации ATS (URL, secret, auth headers, enabled flag) на уровне компании.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `10-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Конфигурация webhook для ATS» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/migrations/0xx_create_ats_webhook_configs.sql`
- `backend/src/modules/integrations/ats/entities/ats-webhook-config.entity.ts`
- `backend/src/modules/integrations/ats/repositories/ats-webhook-config.repository.ts`
- `backend/src/modules/integrations/ats/graphql/ats-webhook-config.resolver.ts`
- `backend/src/modules/integrations/ats/dto/upsert-ats-webhook-config.input.ts`
- `backend/src/modules/integrations/ats/validators/webhook-url.validator.ts`

## Requirements

1. URL только HTTPS в production окружении.
2. Secret хранится в зашифрованном виде или через KMS abstraction.
3. Возможность отключить интеграцию через `enabled=false`.
4. Конфигурация привязана к `company_id`.
5. Аудит обновлений (created_at/updated_at/updated_by).

## Step-by-step Plan

1. Создать миграцию таблицы `ats_webhook_configs` с уникальным `company_id`.
2. Реализовать repository методы `getByCompanyId` и `upsert`.
3. Добавить GraphQL mutation/query для настройки интеграции в админке.
4. Провалидировать URL/headers/timeout и ограничить длину полей.
5. Скрывать секрет в ответах API (masking).

## Acceptance Criteria

- Конфигурация ATS сохраняется и читается по `company_id`.
- Секрет не утекaет в API-ответах и логах.
- Невалидный URL не проходит валидацию.

## Checks

```bash
cd backend && npm run migrate
cd backend && npm run build
cd backend && npm run test -- ats-webhook-config
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
