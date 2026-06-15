# ⬜ TASK-12.2 — Production Docker для backend

Status: [ ] todo  
Priority: High  
Parent block: `12-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Подготовить production-ориентированный Dockerfile backend с безопасным runtime, healthcheck и минимальным размером образа.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `12-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Production Docker для backend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `backend/Dockerfile`
- `backend/.dockerignore`
- `docker/backend/entrypoint.sh`
- `docs/deployment/backend-image.md`

## Requirements

1. Multi-stage build с `npm ci --omit=dev` в runtime.
2. Контейнер запускается от non-root пользователя.
3. HEALTHCHECK вызывает `/health`.
4. Поддержка миграций до старта приложения через entrypoint.
5. Образ сканируется на уязвимости в CI.

## Step-by-step Plan

1. Обновить Dockerfile для production best practices.
2. Добавить entrypoint с preflight-проверками env и БД.
3. Настроить `.dockerignore` для уменьшения контекста сборки.
4. Описать команды build/run/tag в docs.
5. Проверить контейнер локально на cold start и healthcheck.

## Acceptance Criteria

- Backend production image стабильно собирается и стартует.
- Контейнер работает от non-root и проходит healthcheck.
- Инструкция по использованию образа документирована.

## Checks

```bash
docker build -t ai-interviewer-backend:prod ./backend
docker run --rm -p 3000:3000 --env-file backend/.env.production.example ai-interviewer-backend:prod
curl -s http://localhost:3000/health
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
