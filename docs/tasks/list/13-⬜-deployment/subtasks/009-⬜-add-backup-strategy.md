# ⬜ TASK-13.9 — Стратегия резервного копирования

Status: [ ] todo  
Priority: High  
Parent block: `13-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Сформировать backup strategy для MySQL, Redis и медиа-хранилища с расписанием, retention и обязательной проверкой восстановления.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `13-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Стратегия резервного копирования» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/ops/backup-strategy.md`
- `infra/backup/mysql-backup.sh`
- `infra/backup/redis-backup.sh`
- `infra/backup/restore-drill.md`

## Requirements

1. Бэкапы MySQL: full + binlog/incremental по расписанию.
2. Redis backup с учётом persistence режима и RPO требований.
3. Версионирование bucket и cross-region копии для медиа.
4. Retention policy (например 7/30/90 дней) и удаление старых снимков.
5. Регулярный restore drill минимум 1 раз в месяц.

## Step-by-step Plan

1. Описать целевые RPO/RTO и ответственность команд.
2. Подготовить backup скрипты/команды для базовых сценариев.
3. Задокументировать процедуру восстановления шаг за шагом.
4. Добавить checklist restore drill и критерии успеха.
5. Провести тестовое восстановление на staging и зафиксировать результаты.

## Acceptance Criteria

- Backup strategy формализована и покрывает критичные данные.
- Есть рабочая и проверенная процедура восстановления.
- Команда понимает RPO/RTO и периодичность drill-проверок.

## Checks

```bash
test -f docs/ops/backup-strategy.md
test -f infra/backup/mysql-backup.sh
test -f infra/backup/restore-drill.md
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
