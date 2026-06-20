# TASK-16.6 — Backend: расширить create interview config-полями

Status: [x] done

## Goal

Провести новые config-поля через единую точку создания интервью.

## Depends on

- TASK-16.5.

## Context

- Единая точка — `InterviewCoreService.createInterview()` (`backend/src/modules/interview-core/`).
- Input сейчас — `CreateInterviewInput` (`backend/src/modules/interview-core/dto/create-interview.input.ts`).

## Scope

- `create-interview.input.ts`: добавить поля `aiTone`, `probingDepth`, `scoringStrictness`, `expiresAt`, `maxCompletions`, `allowRetake`, `timeLimitMinutes`, `passingScore`, required-поля кандидата. Валидация (enum, диапазоны, `passingScore` в пределах шкалы).
- `interview-core.repository.ts`: INSERT новых колонок (дефолты при отсутствии).
- `interview-core.mapper.ts` + `types/interview.type.ts`: вернуть новые поля в `InterviewType`.
- Регенерация `backend/src/schema.gql` + frontend GraphQL operations при необходимости (отдельно в FE-subtasks).

## Verification

- `pnpm -C backend build` + targeted eslint.
- GraphQL smoke: `createInterview` с новыми полями сохраняет их; query интервью возвращает их; дефолты применяются при отсутствии.

## Completion Notes

**Сделано:**
- Новый файл `types/interview-config.enum.ts`: GraphQL-энумы `AiTone`/`ProbingDepth`/`ScoringStrictness` (+ string-union типы, дефолты, границы `passingScore` 0–10).
- `dto/create-interview.input.ts`: добавлены `aiTone`/`probingDepth`/`scoringStrictness` (`@IsEnum`), `expiresAt` (`@IsDateString`), `maxCompletions`/`timeLimitMinutes` (`@IsInt @Min(1)`), `allowRetake`/`requirePhone`/`requireLinkedin`/`requireGithub` (`@IsBoolean`), `passingScore` (`@IsNumber @Min(0) @Max(10)`). Все optional.
- `entities/interview.entity.ts`: расширен `InterviewEntity`.
- `interview-core.repository.ts`: `InterviewRow` + 4 SELECT (3 unprefixed + 1 с `i.`-префиксом) + `CreateInterviewData` + INSERT (новые колонки, дефолты при отсутствии) + `mapInterview`.
- `types/interview.type.ts`: новые поля в `InterviewType` (enum non-null, остальные nullable; `expiresAt` как ISO String).
- `interview-core.mapper.ts`: проброс новых полей (`expiresAt` → `toISOString()`).
- `interview-core.service.ts`: дефолты (`neutral`/`balanced`/`balanced`, `false`, `null`) при отсутствии в input; `expiresAt` → `new Date(...)`.
- `src/schema.gql` регенерирован bootstrap'ом dev-инстанса: добавлены enum `AiTone`/`ProbingDepth`/`ScoringStrictness`, поля в `CreateInterviewInput` и `InterviewType`.
- Инвариант соблюдён: поля влияют на разговор/оценку (применят 16.8–16.10), снапшот вопросов/checkpoints не затронут.
- Templates `createInterviewFromTemplate` компилируется без изменений (новые поля input optional → дефолты).

**Верификация:**
- `pnpm -C backend run build` → OK (дважды: после правок и после prettier --fix).
- Targeted eslint на 7 изменённых/новых файлов → clean (prettier-замечания исправлены `--fix`).
- GraphQL smoke (свой dev-инстанс на PORT=4123, NODE_ENV=development, та же локальная БД; инстанс остановлен после теста):
  - `register` → accessToken (company 8 / user 8).
  - `createInterview` с полным набором config (`aiTone=strict`, `probingDepth=deep`, `scoringStrictness=lenient`, `expiresAt`, `maxCompletions=50`, `allowRetake=true`, `timeLimitMinutes=45`, `passingScore=7.5`, `requirePhone/Linkedin=true`, `requireGithub=false`) → interview id 21, все поля вернулись как заданы. Ожидал сохранение/возврат — получено.
  - `createInterview` без config-полей → interview id 22, дефолты (`neutral`/`balanced`/`balanced`, nulls, `false`). Ожидал дефолты — получено.
  - `query interview(id:21)` → round-trip вернул те же значения. Ожидал персистентность — получено.
  - Валидация: `passingScore: 15` → `BAD_REQUEST` `"passingScore must not be greater than 10"`. Ожидал отказ — получено.
  - DB-проверка `SELECT ... FROM interviews WHERE id IN (21,22)` подтвердила колонки (`7.50`, `2026-12-31 23:59:00`, флаги 1/0; id 22 — дефолты).
