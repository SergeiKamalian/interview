# ⬜ TASK-11.3 — Сборка и деплой frontend

Status: [ ] todo  
Priority: High  
Parent block: `11-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Организовать production build frontend и публикацию статических артефактов через Nginx/объектное хранилище с CDN.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `11-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Сборка и деплой frontend» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `docs/deployment/frontend-deploy.md`
- `.github/workflows/frontend-deploy.yml`

## Requirements

1. Build использует `npm ci` и `npm run build`.
2. Nginx корректно отдаёт SPA (`try_files ... /index.html`).
3. Кэширование статических ассетов с long max-age.
4. Env-инъекция описана для runtime/static сценариев.
5. Проверен fallback для client-side routes.

## Step-by-step Plan

1. Создать/обновить frontend Dockerfile с multi-stage (builder + nginx).
2. Добавить production `nginx.conf` для SPA и gzip.
3. Описать деплой сценарии: container registry или static bucket + CDN.
4. Подготовить пример CI job на публикацию frontend артефакта.
5. Проверить, что маршруты `/dashboard/*` открываются после refresh.

## Acceptance Criteria

- Frontend production build повторяем и стабилен.
- SPA корректно работает при прямых переходах по route.
- Деплой-документация описывает реальный процесс публикации.

## Checks

```bash
docker build -t ai-interviewer-frontend:prod ./frontend
docker run --rm -p 8080:80 ai-interviewer-frontend:prod
curl -I http://localhost:8080/
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
