# 16 — Enhanced Interview Creation Flow Tasks

Overall status: ✅ done

Один prompt = один subtask. Перед каждым subtask читать `docs/interview-creation/README.md`.

Зависимости указаны в каждом subtask-файле (поле `Depends on`). Рекомендуемый порядок — по номеру.

---

## Subtasks

### TASK-16.1 — Зафиксировать interview creation flow design

Status: [x] done
File: `subtasks/001-✅-document-interview-creation-design.md`

### TASK-16.2 — Backend: list-queries professions/skills/topics

Status: [x] done
File: `subtasks/002-✅-backend-lookup-queries.md`

### TASK-16.3 — Backend: фильтр skillIds + skills-first ordering

Status: [x] done
File: `subtasks/003-✅-backend-skill-filter.md`

### TASK-16.4 — Backend: AI-подбор вопросов из банка

Status: [x] done
File: `subtasks/004-✅-backend-ai-question-selection.md`

### TASK-16.5 — DB migration: config-поля на interviews + templates

Status: [x] done
File: `subtasks/005-✅-db-config-columns.md`

### TASK-16.6 — Backend: расширить create interview config-полями

Status: [x] done
File: `subtasks/006-✅-backend-extend-create-interview.md`

### TASK-16.7 — Backend: проброс config в adaptive context packet

Status: [x] done
File: `subtasks/007-✅-backend-context-packet-config.md`

### TASK-16.8 — Backend: tone preset в промпты

Status: [x] done
File: `subtasks/008-✅-backend-tone-preset.md`

### TASK-16.9 — Backend: probing depth preset → limits override

Status: [x] done
File: `subtasks/009-✅-backend-probing-depth-preset.md`

### TASK-16.10 — Backend: scoring strictness preset → rubric + guards

Status: [x] done
File: `subtasks/010-✅-backend-strictness-preset.md`

### TASK-16.11 — Backend: enforcement лимитов на входе кандидата

Status: [x] done
File: `subtasks/011-✅-backend-enforce-access-limits.md`

### TASK-16.12 — Backend: JD → prefill resolver

Status: [x] done
File: `subtasks/012-✅-backend-jd-prefill.md`

### TASK-16.13 — Frontend: hooks professions/skills/topics

Status: [x] done
File: `subtasks/013-✅-frontend-lookup-hooks.md`

### TASK-16.14 — Frontend: визард создания (шаги 1,3–7) + state/nav

Status: [x] done
File: `subtasks/014-✅-frontend-wizard-shell.md`

### TASK-16.15 — Frontend: шаг 2 — подбор вопросов (score/skills-first/AI)

Status: [x] done
File: `subtasks/015-✅-frontend-question-step.md`

### TASK-16.16 — Frontend: JD generate modal

Status: [x] done
File: `subtasks/016-✅-frontend-jd-modal.md`

### TASK-16.17 — Frontend: lifecycle + redirects + страница управления

Status: [x] done
File: `subtasks/017-✅-frontend-lifecycle-manage.md`

### TASK-16.18 — Templates parity + редактируемое create-from-template

Status: [x] done
File: `subtasks/018-✅-templates-parity-editable.md`

### TASK-16.19 — Live preview «попробовать как кандидат»

Status: [x] done
File: `subtasks/019-✅-live-preview.md`

---

## Completion Rule

Блок можно закрыть только когда:

- backend отдаёт professions/skills/topics, фильтрует по skillIds, умеет AI-подбор вопросов;
- новые config-поля (tone/depth/strictness, лимиты, пороги) проходят весь путь: миграция → create input → snapshot/interview row → adaptive engine;
- лимиты (дедлайн/кап/попытки) энфорсятся на входе кандидата;
- frontend визард создаёт интервью со всеми настройками, шаг 2 показывает score/skills-first + AI-кнопку;
- JD-модалка предзаполняет визард; шаблон предзаполняет редактируемый визард;
- после создания — редирект на страницу управления; live preview работает;
- smoke-check (GraphQL + UI) подтверждает end-to-end создание.
