# ⬜ TASK-12.8 — Логи и мониторинг

Status: [ ] todo  
Priority: High  
Parent block: `12-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Настроить базовую наблюдаемость: централизованные логи, ключевые метрики, алерты и operational dashboard.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `12-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Логи и мониторинг» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/ops/logs-monitoring.md`
- `backend/src/common/logger/logger.module.ts`
- `backend/src/modules/health/health.controller.ts`
- `infra/monitoring/alerts.example.yml`

## Requirements

1. Логи структурированы JSON и содержат request/correlation id.
2. Метрики: error rate, latency p95, queue lag, failed jobs.
3. Alerts по деградации health, росту 5xx и падению worker.
4. Dashboard для backend/queue/db состояния.
5. Runbook для реакции на критические алерты.

## Step-by-step Plan

1. Проверить/доработать structured logging в backend.
2. Описать точки интеграции с Grafana/Datadog/Prometheus.
3. Подготовить шаблон алертов с порогами для MVP.
4. Добавить раздел incident response в docs.
5. Провести smoke-проверку: искусственно сгенерировать ошибку и убедиться, что она видна в логах.

## Acceptance Criteria

- Минимальный monitoring baseline готов к production запуску.
- Критичные сбои видны через алерты и логи.
- Есть runbook для быстрой диагностики инцидентов.

## Checks

```bash
cd backend && npm run build
test -f docs/ops/logs-monitoring.md
test -f infra/monitoring/alerts.example.yml
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
