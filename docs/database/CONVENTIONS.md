# Database Conventions

Единые правила проектирования и написания SQL для AI Interviewer Platform.

**Database:** MySQL 8+  
**Подход:** SQL-first, raw migration files, `schema_migrations`, без ORM  
**Эталон:** архитектура миграций как в `captcha-back` — `/Users/sergeykamalyan/Desktop/russkiy/капча/captcha-back`

Design docs в `docs/database/` — source of truth для схемы. Реальные `.sql` files создаются позже в feature-блоках строго по этим правилам.

---

## Принципы

1. **Explicit DDL** — PK, FK, indexes и constraints описываются явно в SQL, не генерируются ORM.
2. **Predictable naming** — snake_case, plural table names, единые префиксы для indexes и FK.
3. **Multi-tenant by design** — company-scoped данные всегда содержат `company_id`.
4. **Normalized by default** — relational data в таблицах; JSON только для audit/raw payloads.
5. **Reviewable migrations** — каждый migration file читается как plain SQL в git diff.

### Запрещено

- Prisma (schema, migrations, client).
- TypeORM entities / `synchronize: true` / auto-generated schema.
- MongoDB, PostgreSQL как primary database.
- Auto-generated ORM schema как source of truth.
- Создание business tables в feature-блоке без design doc из `docs/database/schemas/`.

---

## Engine, charset, collation

Все таблицы:

```sql
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
```

- **InnoDB** — transactions, FK, row-level locking.
- **utf8mb4** — полная поддержка Unicode (emoji, все языки интервью).
- **utf8mb4_unicode_ci** — case-insensitive сравнение для большинства text fields.

---

## Tables

### Naming

| Правило | Пример |
|--------|--------|
| plural snake_case | `users`, `companies`, `interview_attempts` |
| junction tables: `<parent_a>_<parent_b>` | `company_memberships`, `question_skills` |
| child/detail tables: `<parent>_<detail>` | `question_checkpoints`, `interview_questions` |
| log/history tables: `<entity>_<purpose>` | `ai_usage_logs`, `ats_webhook_logs` |

### Хорошие имена

```txt
users
companies
company_memberships
questions
question_checkpoints
interviews
interview_attempts
interview_questions
checkpoint_results
```

### Плохие имена

```txt
User              -- PascalCase, singular
tblUsers          -- префикс tbl_
questionBank      -- camelCase
interview-attempts  -- kebab-case
Questions_v2      -- версия в имени таблицы
```

### Порядок колонок в CREATE TABLE

1. `id` (PK)
2. tenant / ownership columns (`company_id`, `user_id`, …)
3. business columns
4. status / flags
5. `created_at`, `updated_at`
6. optional `deleted_at`
7. PRIMARY KEY, UNIQUE, KEY, CONSTRAINT

---

## Primary keys

**Стандарт:** `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT`

```sql
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
PRIMARY KEY (id)
```

### Почему BIGINT UNSIGNED, а не UUID как PK

- Согласовано с `captcha-back` (новые таблицы используют `BIGINT UNSIGNED`).
- Компактные FK и indexes.
- Предсказуемый порядок вставки для time-ordered данных.
- Достаточный диапазон для B2B SaaS (до ~18 quintillion rows).

### UUID / public tokens

UUID **не используется как PK**. Для публичных ссылок и внешних идентификаторов — отдельная колонка:

```sql
public_token CHAR(36) NOT NULL,  -- UUID v4 string
UNIQUE KEY uq_interviews_public_token (public_token)
```

Генерация `public_token` — на уровне application layer, не MySQL `UUID()`.

---

## Standard columns

### Обязательные для большинства таблиц

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT` | PK |
| `created_at` | `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` | момент создания |
| `updated_at` | `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | последнее изменение |

### Опциональные

| Column | Type | Когда использовать |
|--------|------|-------------------|
| `deleted_at` | `TIMESTAMP NULL` | soft delete только где нужен undo/recovery |
| `created_by_user_id` | `BIGINT UNSIGNED NULL` | audit: кто создал запись |
| `updated_by_user_id` | `BIGINT UNSIGNED NULL` | audit: кто изменил запись |

### Soft delete policy

- **По умолчанию — hard delete** или status column (`status = 'archived'`).
- `deleted_at` добавлять только для сущностей, где soft delete — продуктовое требование (например, `questions` в question bank).
- Если есть `deleted_at`, все SELECT в application layer должны фильтровать `deleted_at IS NULL`, если не запрошен archived scope.

---

## Columns

### Naming

- snake_case, lowercase.
- boolean: префикс `is_` или `has_` → `is_active`, `has_video`.
- FK column: `<referenced_table_singular>_id` → `company_id`, `user_id`, `interview_id`.
- counts: суффикс `_count` → `question_count`.
- durations: суффикс `_seconds` или `_ms` → `duration_seconds`.
- amounts/scores: явное имя → `score`, `max_score`, `weight`.

### Хорошие имена колонок

```txt
email
password_hash
company_id
public_token
question_text
max_score
is_active
hire_recommendation
```

### Плохие имена колонок

```txt
Email
companyId
pwd
q_text
flag1
data_json_blob
```

---

## Foreign keys

### Naming

```txt
fk_<child_table>_<parent_table>
```

Примеры:

```sql
CONSTRAINT fk_company_memberships_company
  FOREIGN KEY (company_id) REFERENCES companies (id)

CONSTRAINT fk_interview_attempts_interview
  FOREIGN KEY (interview_id) REFERENCES interviews (id)
```

Если несколько FK на одну parent table — добавить column hint:

```sql
CONSTRAINT fk_interviews_created_by_user
  FOREIGN KEY (created_by_user_id) REFERENCES users (id)
```

### ON DELETE / ON UPDATE

| Связь | Рекомендация |
|-------|-------------|
| child lifecycle tied to parent (memberships, snapshots) | `ON DELETE CASCADE` |
| optional reference (created_by) | `ON DELETE SET NULL` |
| core business FK (interview → company) | default RESTRICT / NO ACTION |
| lookup/reference tables | `ON DELETE RESTRICT` |

Всегда явно документировать выбор в design doc домена.

### FK column type

Тип FK column **должен совпадать** с типом referenced PK (`BIGINT UNSIGNED`).

---

## Indexes

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| non-unique index | `idx_<table>_<columns>` | `idx_interview_attempts_interview_id` |
| unique index | `uq_<table>_<columns>` | `uq_users_email` |
| composite | columns через `_` | `idx_messages_attempt_created (interview_attempt_id, created_at)` |

### Правила

- PK создаётся через `PRIMARY KEY (id)` — отдельное имя не нужно.
- Каждый FK column — index (MySQL не создаёт index автоматически на FK side в старых версиях; явно добавляем `KEY`).
- Unique business keys — `UNIQUE KEY`, не только application validation.
- Composite indexes: наиболее selective column first, если нет других query patterns.

### Примеры

```sql
KEY idx_users_email (email),
UNIQUE KEY uq_companies_slug (slug),
KEY idx_interview_attempts_company_status (company_id, status),
KEY idx_checkpoint_results_evaluation_id (question_evaluation_id)
```

---

## Data types

### Identifiers and text

| Use case | Type |
|----------|------|
| PK / FK | `BIGINT UNSIGNED` |
| public token (UUID) | `CHAR(36)` |
| slug, short code | `VARCHAR(64)` |
| email | `VARCHAR(255)` |
| name, title | `VARCHAR(255)` |
| long text (question, answer, transcript) | `TEXT` |
| very long content | `MEDIUMTEXT` |

### Numbers

| Use case | Type |
|----------|------|
| boolean flag | `TINYINT(1) NOT NULL DEFAULT 0` |
| small counter | `INT UNSIGNED` |
| score 0–10 (incl. decimals) | `DECIMAL(5,2)` |
| per-question max score | `DECIMAL(5,2)` or `TINYINT UNSIGNED` if always integer |
| checkpoint weight | `DECIMAL(5,2)` or `TINYINT UNSIGNED` |
| money / AI cost USD | `DECIMAL(12,6)` |
| duration seconds | `INT UNSIGNED` |
| token count | `INT UNSIGNED` |

**Score rule:** итоговые и per-question scores хранить как `DECIMAL(5,2)` для шкалы 0–10 с точностью до сотых (например, `7.40`).

### Dates

| Use case | Type |
|----------|------|
| created_at / updated_at | `TIMESTAMP` |
| event timestamp (high precision) | `DATETIME(3)` |
| date only | `DATE` |

Timezone: application и MySQL pool используют UTC (`timezone: 'Z'` в DatabaseService).

### ENUM vs VARCHAR

- **MySQL ENUM** — для стабильных маленьких наборов, уже используется в `captcha-back` (например, `role`, `status`).
- **VARCHAR + CHECK** — если набор значений может расширяться без migration ALTER ENUM.

Document allowed values в design doc домена в любом случае.

Примеры enum-полей продукта (имена колонок, значения на английском):

```txt
candidate_level: junior | middle | senior | lead
interview_status: draft | active | archived
attempt_status: pending | in_progress | completed | abandoned
hire_recommendation: strong_reject | reject | maybe | invite | strong_invite
candidate_category: weak | basic | average | good | strong
```

---

## JSON columns policy

### Когда JSON допустим

- raw AI response payload (полный structured JSON от модели);
- provider metadata (model name, latency, token usage snapshot);
- flexible integration config, если структура зависит от ATS provider;
- non-queryable audit snapshots.

```sql
raw_response JSON NULL,
provider_metadata JSON NULL
```

### Когда JSON запрещён (нужна нормализация)

- question bank: checkpoints, weights, examples → отдельные таблицы;
- per-checkpoint evaluation results → `checkpoint_results`;
- skills/stacks/topics → relational tables + junction tables;
- anything used in WHERE/GROUP BY/ORDER BY analytics → columns или normalized tables.

### Правила для JSON columns

- Не индексировать JSON path без явной необходимости в design doc.
- Не хранить в JSON единственную копию данных, нужных для dashboard queries.
- Версионировать структуру JSON через application schema validation, не через MySQL.

---

## Multi-tenant

AI Interviewer — B2B multi-tenant продукт. Компания — root tenant.

### Правило `company_id`

Все **company-scoped** таблицы содержат:

```sql
company_id BIGINT UNSIGNED NOT NULL,
KEY idx_<table>_company_id (company_id),
CONSTRAINT fk_<table>_company
  FOREIGN KEY (company_id) REFERENCES companies (id)
```

### Company-scoped (примеры)

```txt
interviews
candidates
interview_attempts
interview_questions
messages
question_evaluations
checkpoint_results
final_evaluations
media_assets
ats_integrations
ai_usage_logs (rollup per company)
```

### Global / shared (без company_id)

```txt
professions
skills
topics
questions (platform-wide question bank — source of truth)
question_checkpoints
users (account exists globally; access to company via company_memberships)
schema_migrations
```

### Junction access

Доступ user → company через `company_memberships`, не через дублирование user rows per company.

---

## Public entities

Сущности с публичной ссылкой (interview для кандидата) **не expose PK**.

```sql
-- interviews
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,        -- internal PK
public_token CHAR(36) NOT NULL,                    -- external link token
UNIQUE KEY uq_interviews_public_token (public_token)
```

Правила:

- `public_token` — cryptographically random UUID v4 (или аналог).
- Unique index обязателен.
- PK (`id`) не передаётся в public candidate flow URL.
- Lookup по public page: `WHERE public_token = ? AND deleted_at IS NULL`.

---

## Migration files (naming preview)

Полная политика — в `docs/database/MIGRATIONS.md` (TASK-02.2). Кратко:

```txt
backend/migrations/
  001_create_schema_migrations.sql
  002_create_users_and_companies.sql
  ...
```

- prefix: zero-padded number `NNN_`;
- snake_case description;
- one logical change per file when possible;
- `CREATE TABLE IF NOT EXISTS` в idempotent migrations (как в `captcha-back`).

---

## Domain examples

### `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `companies`

```sql
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(64) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_companies_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `questions` (global question bank)

```sql
CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  profession_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  level ENUM('junior', 'middle', 'senior', 'lead') NOT NULL,
  difficulty ENUM('basic', 'intermediate', 'advanced') NOT NULL,
  question_text TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  ideal_answer TEXT NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_questions_profession_level (profession_id, level),
  KEY idx_questions_topic_id (topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `interview_attempts` (company-scoped)

```sql
CREATE TABLE IF NOT EXISTS interview_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  interview_id BIGINT UNSIGNED NOT NULL,
  candidate_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_interview_attempts_company_id (company_id),
  KEY idx_interview_attempts_interview_id (interview_id),
  KEY idx_interview_attempts_candidate_id (candidate_id),
  KEY idx_interview_attempts_company_status (company_id, status),
  CONSTRAINT fk_interview_attempts_company
    FOREIGN KEY (company_id) REFERENCES companies (id),
  CONSTRAINT fk_interview_attempts_interview
    FOREIGN KEY (interview_id) REFERENCES interviews (id),
  CONSTRAINT fk_interview_attempts_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Design docs versioning

- Design docs живут в git (`docs/database/`), версионируются через commits.
- Изменение design doc **не заменяет** уже применённую migration — для изменения схемы нужен новый migration file.
- Feature-блок перед новой migration проверяет актуальность соответствующего `docs/database/schemas/*.md`.

---

## Checklist перед написанием domain schema

- [ ] Table name plural snake_case
- [ ] PK `BIGINT UNSIGNED AUTO_INCREMENT`
- [ ] `created_at` / `updated_at` present
- [ ] `company_id` if company-scoped
- [ ] FK constraints named `fk_<child>_<parent>`
- [ ] Indexes named `idx_` / `uq_`
- [ ] `utf8mb4` / `utf8mb4_unicode_ci`
- [ ] Scores as `DECIMAL(5,2)` where applicable
- [ ] JSON only for raw/audit payloads
- [ ] Public links use `public_token`, not PK

---

## Related documents

- `docs/DECISIONS.md` — MySQL, SQL migrations, no ORM
- `docs/database/MIGRATIONS.md` — migration policy (TASK-02.2)
- `docs/database/schemas/*.md` — domain schemas (TASK-02.3+)
