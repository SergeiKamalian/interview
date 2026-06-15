# ⬜ TASK-12.6 — Настройка storage для audio/video

Status: [ ] todo  
Priority: High  
Parent block: `12-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Подготовить конфигурацию и инструкции для хранения аудио/видео артефактов интервью в S3-совместимом object storage.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `12-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «Настройка storage для audio/video» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/deployment/media-storage-setup.md`
- `backend/src/common/storage/storage.module.ts`
- `backend/src/common/storage/s3-storage.service.ts`
- `backend/src/common/config/storage-env.schema.ts`

## Requirements

1. Поддержка S3 API: bucket, region, endpoint, credentials.
2. Server-side encryption и приватный доступ по умолчанию.
3. Presigned URL для временного доступа к медиа.
4. Lifecycle rules для автоочистки старых файлов.
5. Папочная структура ключей: `company/interview/session/...`.

## Step-by-step Plan

1. Описать storage env переменные и безопасные значения.
2. Реализовать/доработать storage service abstraction в backend.
3. Добавить health/probe проверку доступности bucket.
4. Задокументировать создание bucket policy и CORS.
5. Проверить upload/download flow на staging с реальным файлом.

## Acceptance Criteria

- Медиа storage подключается и работает в production-like окружении.
- Доступ к файлам контролируется через presigned URL.
- Есть понятные инструкции по безопасности и lifecycle.

## Checks

```bash
cd backend && npm run build
test -f docs/deployment/media-storage-setup.md
rg "S3_|STORAGE_|BUCKET" backend/.env.production.example docs/deployment/media-storage-setup.md
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
