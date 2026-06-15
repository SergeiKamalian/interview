# ⬜ TASK-11.2 — Отправка результата при завершении интервью

Status: [ ] todo  
Priority: High  
Parent block: `11-⬜-ats-integrations`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Реализовать автоматическую отправку результатов интервью в ATS после перехода интервью в статус `completed`.

## Context

После завершения AI-интервью результаты должны уходить во внешние системы рекрутмента (Greenhouse/Lever/Huntflow-подобные) без ручного копирования. На MVP нужен надёжный outbound pipeline с наблюдаемостью и минимальным vendor lock-in.

Эта подзадача — часть блока `11-⬜-ats-integrations` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Отправка результата при завершении интервью» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Двусторонняя синхронизация вакансий/кандидатов из ATS.
- UI-маркетплейс интеграций с OAuth connect flow.
- Сложные mapping-конструкторы полей с drag-and-drop.
- Billing за интеграции и лимиты тарифа.
- Vendor-specific SDK глубокой степени (только общий HTTP adapter).

## Files / Folders Allowed

- `backend/src/modules/interview/events/interview-completed.event.ts`
- `backend/src/modules/integrations/ats/services/ats-dispatch.service.ts`
- `backend/src/modules/integrations/ats/services/payload-builder.service.ts`
- `backend/src/modules/integrations/ats/listeners/interview-completed.listener.ts`
- `backend/src/modules/integrations/ats/contracts/ats-result-payload.ts`

## Requirements

1. Dispatch запускается только один раз на интервью (idempotency key).
2. Отправка не блокирует основной completion flow кандидата.
3. Payload включает candidate, vacancy, score, recommendation, checkpoints.
4. Поддержка HMAC-signature заголовка при наличии secret.
5. Timeout и user-agent задаются централизованно.

## Step-by-step Plan

1. Подписаться на domain event завершения интервью.
2. Собрать payload через выделенный builder и контрактный тип.
3. Отправить POST в configured webhook endpoint.
4. Добавить idempotency marker в БД/логе, чтобы исключить дубли.
5. Обработать fallback: если интеграция выключена, dispatch пропускается без ошибки.

## Acceptance Criteria

- При completion интервью уходит outbound request в ATS.
- Повторная обработка события не создаёт дубликаты отправки.
- Ошибка интеграции не ломает завершение интервью для кандидата.

## Checks

```bash
cd backend && npm run build
cd backend && npm run test -- ats-dispatch
cd backend && npm run test:e2e -- interview-completion
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
