# ⬜ TASK-12.5 — Redis production setup

Status: [ ] todo  
Priority: Medium  
Parent block: `12-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Определить production-конфигурацию Redis для очередей/кэша: persistence, memory policy, security и мониторинг.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `12-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Redis production setup» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/deployment/redis-production-setup.md`
- `infra/redis/redis.conf`
- `infra/redis/README.md`

## Requirements

1. Отключён dangerous default (`protected-mode` учитывается по сети).
2. Настроены `maxmemory` и `maxmemory-policy` под queue/cache нагрузку.
3. Persistence стратегия (AOF/RDB) выбрана и обоснована.
4. Пароль/ACL и ограничение доступа по сети.
5. Отдельные DB/index или namespace для разных типов данных.

## Step-by-step Plan

1. Подготовить референс `redis.conf` под production.
2. Описать сценарий managed Redis и self-hosted различия.
3. Задокументировать параметры для BullMQ и rate limiting.
4. Добавить runbook по восстановлению после рестарта Redis.
5. Проверить конфигурацию на staging workload.

## Acceptance Criteria

- Redis production настройки зафиксированы в документации и конфиге.
- Снижен риск потери jobs из очереди из-за неверных параметров.
- Команда понимает, как поддерживать Redis в проде.

## Checks

```bash
test -f docs/deployment/redis-production-setup.md
test -f infra/redis/redis.conf
rg "maxmemory|appendonly|requirepass|acl" infra/redis/redis.conf
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
