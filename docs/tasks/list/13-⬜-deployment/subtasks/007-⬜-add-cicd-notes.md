# ⬜ TASK-13.7 — CI/CD заметки и pipeline

Status: [ ] todo  
Priority: Medium  
Parent block: `13-⬜-deployment`  
Owner: Cursor / Sergey  
Last updated: 2026-06-12

---

## Goal

Составить рабочие CI/CD notes с этапами тестирования, сборки, публикации образов и деплоя в staging/prod.

## Context

MVP должен быть не только функциональным, но и разворачиваемым без ручного шаманства. Нужны понятные инструкции и базовая эксплуатационная надёжность для первого production клиента.

Эта подзадача — часть блока `13-⬜-deployment` и должна давать измеримый increment для AI Interviewer Platform без выхода за границы текущего блока.

## Scope

Реализовать «CI/CD заметки и pipeline» в рамках разрешённых файлов и папок. Результат должен быть проверяем локально через команды из раздела Checks.

## Out of Scope

- Полноценный Kubernetes platform engineering с helm-операторами.
- Мульти-региональный active-active failover.
- Сертифицированные enterprise-политики безопасности (SOC2 пакет).
- Blue/green automation уровня крупного enterprise.
- Полный FinOps и автооптимизация затрат.

## Files / Folders Allowed

- `docs/deployment/cicd-notes.md`
- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/deploy.yml`

## Requirements

1. Pipeline включает lint, unit tests, build, image scan.
2. Разделение release на staging и production с approval.
3. Tagging strategy: semver + commit sha.
4. Rollback инструкция для неудачного релиза.
5. Секреты CI берутся из GitHub Secrets/CI vault.

## Step-by-step Plan

1. Описать последовательность CI шагов и минимальные quality gates.
2. Добавить примеры workflow файлов или обновить существующие.
3. Задокументировать deployment trigger и required approvals.
4. Добавить шаблон release checklist.
5. Провести dry-run pipeline на тестовой ветке.

## Acceptance Criteria

- CI/CD заметки отражают фактический процесс поставки.
- Команда понимает, как выпускать и откатывать релизы.
- Quality gates формализованы перед production deploy.

## Checks

```bash
test -f docs/deployment/cicd-notes.md
ls .github/workflows
rg "build|deploy|staging|production" docs/deployment/cicd-notes.md
```

## Completion Notes

_Заполнить после выполнения: что сделано, компромиссы, follow-ups, команды проверки._
