# TASK-16.5 — DB migration: config-поля на interviews + templates

Status: [x] done

## Goal

Добавить колонки под поведение AI и лимиты прохождения.

## Depends on

- TASK-16.1.

## Context

- Текущих полей поведения/лимитов нет (проверено по миграциям через `019`).
- Raw SQL migrations + runner + `schema_migrations` (см. `backend/migrations/`).

## Scope

- Новая миграция `backend/migrations/020_interview_config_fields.sql`.
- На `interviews` добавить:
  - `ai_tone` ENUM('friendly','neutral','strict') NOT NULL DEFAULT 'neutral'
  - `probing_depth` ENUM('shallow','balanced','deep') NOT NULL DEFAULT 'balanced'
  - `scoring_strictness` ENUM('lenient','balanced','strict') NOT NULL DEFAULT 'balanced'
  - `expires_at` DATETIME NULL
  - `max_completions` INT UNSIGNED NULL
  - `allow_retake` TINYINT(1) NOT NULL DEFAULT 0
  - `time_limit_minutes` INT UNSIGNED NULL
  - `passing_score` DECIMAL(4,2) NULL
  - required-поля кандидата: `require_phone`/`require_linkedin`/`require_github` TINYINT(1) DEFAULT 0 (или JSON `candidate_required_fields` — зафиксировать выбор в Notes)
- На `interview_templates` зеркально те же поля, КРОМЕ `expires_at` (дедлайн всегда per-interview).
- Обновить design doc `docs/database/schemas/interview-core.md` и `interview-templates.md`.

## Verification

- Migration runner проходит на чистой БД и идемпотентно (повторный прогон не падает).
- `DESCRIBE interviews;` / `DESCRIBE interview_templates;` показывают новые колонки с дефолтами.

## Completion Notes

**Решение по required-полям кандидата:** отдельные булевы колонки `require_phone` / `require_linkedin` / `require_github` (TINYINT(1) NOT NULL DEFAULT 0), а НЕ JSON `candidate_required_fields`. Причина: индексация/энфорс/типизация GraphQL и единообразие с остальными first-class колонками (как рекомендует design-doc §5). `email` всегда обязателен (не колонка-флаг).

**Сделано:**
- Новая миграция `backend/migrations/020_interview_config_fields.sql`.
- `interviews`: `ai_tone` ENUM('friendly','neutral','strict') DEFAULT 'neutral', `probing_depth` ENUM('shallow','balanced','deep') DEFAULT 'balanced', `scoring_strictness` ENUM('lenient','balanced','strict') DEFAULT 'balanced', `expires_at` DATETIME NULL, `max_completions` INT UNSIGNED NULL, `allow_retake` TINYINT(1) DEFAULT 0, `time_limit_minutes` INT UNSIGNED NULL, `passing_score` DECIMAL(4,2) NULL, `require_phone`/`require_linkedin`/`require_github` TINYINT(1) DEFAULT 0.
- `interview_templates`: те же колонки, КРОМЕ `expires_at` (дедлайн всегда per-interview).
- Обновлены `docs/database/schemas/interview-core.md` и `interview-templates.md`.
- Паттерн миграции — плоский `ALTER TABLE ... ADD COLUMN` (как `014_add_interview_welcome.sql`). Идемпотентность обеспечивается runner'ом через `schema_migrations` (повторный прогон пропускает применённую версию).

**Верификация (выполнена на локальной БД, docker `ai-interviewer-local-mysql-1`, port 3322, db `ai_interviewer`):**
- `pnpm -C backend run migrate` → `Applying migration: 020_interview_config_fields.sql` / `Applied OK`. Ожидал применение — получено.
- Повторный `pnpm -C backend run migrate` → `Database schema is up to date (no pending migrations)`. Ожидал отсутствие падения/повторного применения — получено (идемпотентно).
- `DESCRIBE interviews;` — все 11 новых колонок присутствуют с верными дефолтами (`ai_tone=neutral`, `probing_depth=balanced`, `scoring_strictness=balanced`, `allow_retake=0`, `require_*=0`, nullable: `expires_at`/`max_completions`/`time_limit_minutes`/`passing_score`).
- `DESCRIBE interview_templates;` — те же 10 колонок (без `expires_at`), верные дефолты.
