# 12 — Deployment и эксплуатация Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-12.1 — Документация production env

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-production-env-docs.md
```

Goal:

Собрать исчерпывающую документацию по production переменным, секретам, ротации и правилам хранения.

---

### TASK-12.2 — Production Docker для backend

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-backend-production-docker.md
```

Goal:

Подготовить production-ориентированный Dockerfile backend с безопасным runtime, healthcheck и минимальным размером образа.

---

### TASK-12.3 — Сборка и деплой frontend

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-frontend-build-deploy.md
```

Goal:

Организовать production build frontend и публикацию статических артефактов через Nginx/объектное хранилище с CDN.

---

### TASK-12.4 — MySQL production setup

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-mysql-production-setup.md
```

Goal:

Описать и частично автоматизировать безопасную production-настройку MySQL: users, доступ, конфиг, backup hooks.

---

### TASK-12.5 — Redis production setup

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-redis-production-setup.md
```

Goal:

Определить production-конфигурацию Redis для очередей/кэша: persistence, memory policy, security и мониторинг.

---

### TASK-12.6 — Настройка storage для audio/video

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-audio-video-storage-setup.md
```

Goal:

Подготовить конфигурацию и инструкции для хранения аудио/видео артефактов интервью в S3-совместимом object storage.

---

### TASK-12.7 — CI/CD заметки и pipeline

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-cicd-notes.md
```

Goal:

Составить рабочие CI/CD notes с этапами тестирования, сборки, публикации образов и деплоя в staging/prod.

---

### TASK-12.8 — Логи и мониторинг

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-logs-monitoring.md
```

Goal:

Настроить базовую наблюдаемость: централизованные логи, ключевые метрики, алерты и operational dashboard.

---

### TASK-12.9 — Стратегия резервного копирования

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-backup-strategy.md
```

Goal:

Сформировать backup strategy для MySQL, Redis и медиа-хранилища с расписанием, retention и обязательной проверкой восстановления.

---

## Completion rule

Блок `12-⬜-deployment` считается completed только когда все subtasks `12.1`–`12.9` имеют status `[x] done`; папка переименована в `12-✅-deployment`.
