# TASK-18.3 — DB migration: achieved_level на final_evaluations

Status: [x] done

## Depends on

- TASK-18.2.

## Goal

Хранить демонстрированный уровень на завершённой попытке.

## Scope

- Migration `023_final_evaluation_achieved_level.sql`:
  - `ALTER TABLE final_evaluations ADD COLUMN achieved_level ENUM('junior','middle','senior','lead') NULL`;
  - `ADD COLUMN achieved_level_method ENUM('evidence','estimate') NULL`;
  - индекс `KEY idx_final_evaluations_company_achieved (company_id, achieved_level)` для talent pool.
- Обновить `docs/database/schemas/ai-evaluation.md`.

## Verification

- migration runner проходит; колонки и индекс присутствуют (DESCRIBE / SHOW INDEX).

## Completion Notes

Создан `backend/migrations/023_final_evaluation_achieved_level.sql` в конвенции проекта
(plain `ALTER TABLE` без guards, как 020/021/022; шапка `-- Domain: ai-evaluation` +
`-- Depends on: 007_create_ai_evaluation.sql`):

- `ADD COLUMN achieved_level ENUM('junior','middle','senior','lead') NULL AFTER hire_recommendation`
- `ADD COLUMN achieved_level_method ENUM('evidence','estimate') NULL AFTER achieved_level`
- `ADD INDEX idx_final_evaluations_company_achieved (company_id, achieved_level)`

Идемпотентность: migration runner (`MigrationRunnerService`) трекает применённые версии в
`schema_migrations` и пропускает уже применённые — повторный запуск файл не выполнит.
Charset/engine таблицы не трогаются (наследуются от `007`: utf8mb4 / InnoDB).

`docs/database/schemas/ai-evaluation.md` обновлён: добавлены строки про `achieved_level` /
`achieved_level_method` в таблицу `final_evaluations`, описание индекса для talent pool,
ссылка на миграцию 023 в шапке и DDL reference.

### Verification (реальные действия)

Команды:

1. `pnpm migrate` (cwd `backend/`, DB = MySQL `ai_interviewer` @ localhost:3322,
   контейнер `ai-interviewer-local-mysql-1`).
   - Ожидал: применится только 023.
   - Получил: `Applying migration: 023_final_evaluation_achieved_level.sql` →
     `Applied OK` → `Finished: applied 1 migration(s).`
2. `DESCRIBE final_evaluations;` (через `docker exec ... mysql`).
   - Ожидал: новые колонки присутствуют.
   - Получил:
     ```
     achieved_level         enum('junior','middle','senior','lead')  YES   NULL
     achieved_level_method  enum('evidence','estimate')              YES   NULL
     ```
     (обе после `hire_recommendation`).
3. `SHOW INDEX FROM final_evaluations;`
   - Ожидал: индекс `(company_id, achieved_level)`.
   - Получил:
     ```
     idx_final_evaluations_company_achieved  Seq 1  company_id
     idx_final_evaluations_company_achieved  Seq 2  achieved_level
     ```
     (Non_unique=1).

Результат: миграция применена, колонки и индекс присутствуют — done.
