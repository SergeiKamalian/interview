# 02 — Database Design Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-02.1 — Определить конвенции базы данных

Status: [ ] todo
File:

```txt
subtasks/001-⬜-define-database-conventions.md
```

Goal:

Зафиксировать единые правила именования таблиц, колонок, индексов, FK, enum-значений и типов данных для всего проекта MySQL.

---

### TASK-02.2 — Определить систему миграций

Status: [ ] todo
File:

```txt
subtasks/002-⬜-define-migration-system.md
```

Goal:

Описать политику SQL-миграций: формат файлов, naming, `schema_migrations`, порядок применения, rollback policy и связь с Docker `migrate` service.

---

### TASK-02.3 — Спроектировать схему auth и companies

Status: [ ] todo
File:

```txt
subtasks/003-⬜-design-auth-company-schema.md
```

Goal:

Спроектировать таблицы `users`, `companies`, `company_memberships` с FK, unique constraints и индексами для B2B multi-tenant auth.

---

### TASK-02.4 — Спроектировать схему question bank

Status: [ ] todo
File:

```txt
subtasks/004-⬜-design-question-bank-schema.md
```

Goal:

Спроектировать нормализованную схему банка вопросов: professions, skills, topics, questions, ideal answers, checkpoints, weights, good/bad examples.

---

### TASK-02.5 — Спроектировать схему interview core

Status: [ ] todo
File:

```txt
subtasks/005-⬜-design-interview-core-schema.md
```

Goal:

Спроектировать таблицы interviews, candidates, interview_attempts, interview_questions (snapshot), messages/transcripts для text interview flow.

---

### TASK-02.6 — Спроектировать схему AI evaluation

Status: [ ] todo
File:

```txt
subtasks/006-⬜-design-ai-evaluation-schema.md
```

Goal:

Спроектировать таблицы для хранения AI-оценок: question_evaluations, checkpoint_results, final_evaluations, ai_usage_logs.

---

### TASK-02.7 — Спроектировать схему media metadata

Status: [ ] todo
File:

```txt
subtasks/007-⬜-design-media-storage-schema.md
```

Goal:

Спроектировать таблицы метаданных для audio/video: storage keys, mime types, duration, linkage to interview_attempts.

---

### TASK-02.8 — Спроектировать схему analytics и AI cost

Status: [ ] todo
File:

```txt
subtasks/008-⬜-design-analytics-cost-schema.md
```

Goal:

Спроектировать таблицы/представления для dashboard analytics: агрегаты по topic/skill/question, shortlist, AI cost rollups.

---

### TASK-02.9 — Спроектировать схему ATS integrations

Status: [ ] todo
File:

```txt
subtasks/009-⬜-design-ats-integrations-schema.md
```

Goal:

Спроектировать таблицы webhook config, integration logs, export jobs и retry queue metadata для ATS.

---

### TASK-02.10 — Определить индексы, constraints и performance

Status: [ ] todo
File:

```txt
subtasks/010-⬜-define-indexes-constraints-and-performance.md
```

Goal:

Свести все доменные схемы и зафиксировать единый каталог indexes, FK, unique constraints и performance notes.

---

### TASK-02.11 — Подготовить план реализации базы данных

Status: [ ] todo
File:

```txt
subtasks/011-⬜-prepare-database-implementation-plan.md
```

Goal:

Собрать итоговый implementation plan: порядок SQL migrations, mapping subtasks feature-блоков → migration files, checklist перед стартом auth.

---

## Completion rule

Блок `02-⬜-database-design` считается completed только когда все subtasks `02.1`–`02.11` имеют status `[x] done`; папка переименована в `02-✅-database-design`.