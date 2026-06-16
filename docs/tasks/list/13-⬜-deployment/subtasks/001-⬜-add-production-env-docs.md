# ⬜ TASK-13.1 — Документация production env

Status: [ ] todo  
Priority: High  
Parent block: `13-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Собрать исчерпывающую документацию по production переменным, секретам, ротации и правилам хранения.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `13-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Документация production env» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/deployment/production-env.md`
- `backend/.env.production.example`
- `frontend/.env.production.example`
- `docs/security/secrets-management.md`

## Requirements

1. Все переменные разбиты по сервисам: backend, worker, frontend, infra.
2. Секреты не хранятся в git, только в secret manager.
3. Для каждой переменной указаны назначение, пример и обязательность.
4. Описание ротации ключей (JWT/API/HMAC) и owner команды.
5. Есть check-list перед релизом.

## Step-by-step Plan

1. Собрать фактический список env из backend/frontend кода.
2. Сформировать `.env.production.example` без реальных секретов.
3. Описать процесс выдачи и ротации секретов.
4. Добавить раздел troubleshooting по типичным misconfig.
5. Провести peer review документации с DevOps/Backend.

## Acceptance Criteria

- Production env документация покрывает все runtime сервисы.
- Отсутствуют реальные секреты и приватные токены.
- Новый инженер может настроить окружение без устных инструкций.

## Checks

```bash
test -f docs/deployment/production-env.md
rg "JWT|REDIS|MYSQL|S3|GRAPHQL" docs/deployment/production-env.md
cd backend && npm run build
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
