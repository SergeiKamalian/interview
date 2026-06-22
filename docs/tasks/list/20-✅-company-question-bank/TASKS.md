# 20 — Company Question Bank Tasks

Overall status: ✅ done

---

## Wave 1 — Foundation (schema + backend core)

| # | Task | Суть |
|---|------|------|
| 20.1 | Design doc | `company-question-bank.md`: overlay taxonomy, overrides, priority, import |
| 20.2 | DB migration | `company_id` на topics/skills, metadata на questions, overrides table |
| 20.3 | Company topics/skills API | CRUD + extended lookups для компании |
| 20.4 | Fork + publish + priority | Fork global question, draft/published, priority/isRequired |
| 20.5 | Overrides + snapshot merge | Extra red/green на global; merge при create interview |

### TASK-20.1 — Design doc: company question bank schema

Status: [x] done  
File: `subtasks/001-✅-design-company-question-bank-schema.md`

### TASK-20.2 — DB migration: company taxonomy overlay

Status: [x] done  
File: `subtasks/002-✅-db-company-taxonomy-migration.md`

### TASK-20.3 — Backend: company topics/skills CRUD

Status: [x] done  
File: `subtasks/003-✅-backend-company-topics-skills.md`

### TASK-20.4 — Backend: fork global question + publish + priority

Status: [x] done  
File: `subtasks/004-✅-backend-fork-publish-priority.md`

### TASK-20.5 — Backend: question overrides + snapshot merge

Status: [x] done  
File: `subtasks/005-✅-backend-overrides-snapshot-merge.md`

---

## Wave 2 — Selection priority + UI

| # | Task | Суть |
|---|------|------|
| 20.6 | Custom priority in suggest | Boost company questions + pinned required + AI prompt |
| 20.7 | Question bank CRUD UI | Create/edit/archive, checkpoints editor |
| 20.8 | Company topics + fork UI | Управление своими темами, «Форкнуть» global |
| 20.9 | Wizard custom-first UX | Вкладки Наши/Платформа, badges, pinned в step 2 |

### TASK-20.6 — Backend: custom priority in question selection

Status: [x] done  
File: `subtasks/006-✅-backend-custom-priority-suggest.md`

### TASK-20.7 — Frontend: question bank CRUD UI

Status: [x] done  
File: `subtasks/007-✅-frontend-question-bank-crud.md`

### TASK-20.8 — Frontend: company topics + fork flow

Status: [x] done  
File: `subtasks/008-✅-frontend-company-topics-fork.md`

### TASK-20.9 — Frontend: interview wizard custom-first selection

Status: [x] done  
File: `subtasks/009-✅-frontend-wizard-custom-first.md`

---

## Wave 3 — Import + playbooks

| # | Task | Суть |
|---|------|------|
| 20.10 | Excel import backend | Parse, validate, preview diff, bulk upsert |
| 20.11 | Excel import frontend | Upload wizard + downloadable template |
| 20.12 | Company playbook packs | Pinned required mix + reuse в templates |

### TASK-20.10 — Backend: Excel/CSV bulk import

Status: [x] done  
File: `subtasks/010-✅-backend-excel-import.md`

### TASK-20.11 — Frontend: import wizard + template

Status: [x] done  
File: `subtasks/011-✅-frontend-excel-import-wizard.md`

### TASK-20.12 — Company playbook packs

Status: [x] done  
File: `subtasks/012-✅-company-playbook-packs.md`

---

## Wave 4 — Fork replacement

| # | Task | Суть |
|---|------|------|
| 20.13 | Fork replaces global | Published fork скрывает global в suggest/list для tenant |

### TASK-20.13 — Fork replaces global in selection + tenant smoke

Status: [x] done  
File: `subtasks/013-✅-fork-replaces-global-selection.md`

---

## Completion Rule

Блок можно закрыть только когда:

- [x] company user создаёт/редактирует свои вопросы с checkpoints и red/green flags;
- [x] company user создаёт свои topics/skills или fork'ает global question;
- [x] overrides на global question попадают в interview snapshot;
- [x] `suggestInterviewQuestions` и JD draft **приоритизируют** company questions;
- [x] pinned required questions всегда попадают в интервью;
- [x] Excel import проходит validate → preview → commit без нарушения Σ weights = 10;
- [x] tenant isolation проверен (company A не видит bank company B);
- [x] published fork заменяет global в suggest/list для tenant (20.13);
- [x] playbook packs: CRUD + apply в wizard + save from selection;
- [x] поведение проверено через GraphQL smoke-check, import smoke-check и frontend build.
