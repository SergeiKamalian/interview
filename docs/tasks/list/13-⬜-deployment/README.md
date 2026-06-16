# 13-⬜-deployment — Deployment и эксплуатация

## Цель блока

Сформировать production-ready контур развёртывания: окружения, docker-образы backend/frontend, MySQL/Redis setup, storage для медиа, CI/CD заметки, мониторинг логов и стратегия бэкапов.

## Контекст

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

## Что входит в этот блок

- Документация production env переменных и секретов.
- Production Dockerfile/compose (или k8s-ready) для backend.
- Сборка и деплой frontend статики (Nginx/CDN).
- Боевой setup MySQL с users, backups и параметрами надёжности.
- Боевой setup Redis для очередей, cache и rate limiting.
- Настройка хранилища аудио/видео артефактов интервью.
- Практические CI/CD notes для автоматизации релизов.
- Базовое логирование и мониторинг ключевых метрик/алертов.
- Backup strategy с периодичностью, retention и restore-проверками.

## Что НЕ входит в этот блок

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Важные архитектурные решения

- Backend и worker деплоятся контейнерами из одного репозитория образов.
- Frontend собирается в immutable assets и отдаётся через Nginx + CDN.
- MySQL/Redis размещаются как managed services либо выделенные контейнеры с persistent volumes.
- Медиафайлы (audio/video) хранятся в S3-совместимом object storage.
- CI pipeline: lint/test/build/scan/publish/deploy с ручным approval на prod.
- Observability минимум: централизованные логи + uptime + error rate + очередь jobs.

## Зависимости от предыдущих блоков

- Блок 01/02: стабильные backend/frontend сборки и переменные окружения.
- Блок 10: наличие media pipeline, которому нужно object storage.
- Блок 11: интеграционные очереди/ретраи, требующие надёжного Redis и логов.

## Ожидаемый результат после завершения блока

Команда может воспроизводимо развернуть production-окружение, выпускать релизы через documented pipeline, хранить медиа безопасно, мониторить состояние системы и восстанавливаться из бэкапов в разумные сроки.
