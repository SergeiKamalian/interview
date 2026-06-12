# ⬜ TASK-11.4 — MySQL production setup

Status: [ ] todo  
Priority: High  
Parent block: `11-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Описать и частично автоматизировать безопасную production-настройку MySQL: users, доступ, конфиг, backup hooks.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `11-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «MySQL production setup» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/deployment/mysql-production-setup.md`
- `infra/mysql/init/01-create-users.sql`
- `infra/mysql/init/02-grants.sql`
- `infra/mysql/my.cnf`

## Requirements

1. Отдельные пользователи для app/readonly/maintenance.
2. Минимально необходимые привилегии (least privilege).
3. Рекомендованные параметры InnoDB для workload интервью.
4. TLS/сетевые ограничения доступа к БД.
5. Мониторинг slow query log и connection saturation.

## Step-by-step Plan

1. Подготовить SQL-скрипты создания пользователей и прав.
2. Описать checklist hardening и network policy.
3. Добавить базовые my.cnf рекомендации (charset/collation/timezone).
4. Документировать процедуру миграций в production и rollback.
5. Проверить применимость шагов на staging окружении.

## Acceptance Criteria

- MySQL setup документирован и воспроизводим.
- Права пользователей ограничены и разделены по ролям.
- Есть понятные шаги hardening и операционного сопровождения.

## Checks

```bash
test -f docs/deployment/mysql-production-setup.md
test -f infra/mysql/init/01-create-users.sql
rg "GRANT|REVOKE|IDENTIFIED" infra/mysql/init/*.sql
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
