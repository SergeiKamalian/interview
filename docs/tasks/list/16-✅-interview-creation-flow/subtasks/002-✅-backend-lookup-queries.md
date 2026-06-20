# TASK-16.2 — Backend: list-queries professions/skills/topics

Status: [x] done

## Goal

Дать frontend-визарду источники данных для шага 1 (профессия → релевантные скиллы) и фильтров шага 2.

## Depends on

- TASK-16.1 (design).

## Context

- Справочники глобальные: `professions`, `skills`, `topics` (миграция `backend/migrations/005_create_question_bank.sql`).
- Отдельных GraphQL list-queries сейчас НЕТ; их вытаскивают клиентски из вложенных полей вопросов.
- `profession_skills` таблицы нет. «Скиллы профессии» вычисляем из данных: distinct `skills` у вопросов данной профессии (join `questions.profession_id` → `question_skills` → `skills`).

## Scope

- `backend/src/modules/question-bank/`:
  - repository: `findProfessions()`, `findSkillsByProfession(professionId?)` (distinct через `question_skills`), `findTopics(skillId?/professionId?)`.
  - GraphQL queries: `professions`, `skills(professionId: String)`, `topics(skillId: String, professionId: String)`.
  - Переиспользовать существующие `ProfessionType` / `SkillType` / `TopicType` из `backend/src/schema.gql`.
- Visibility/scope: lookup'ы глобальные; вопросы — по visibility policy `question-bank.schema.ts` (company или global).
- Регенерация `backend/src/schema.gql`.

## Verification

- `pnpm -C backend build` + targeted eslint на изменённые файлы.
- GraphQL smoke (`curl`): `professions` непустой; `skills(professionId)` возвращает только релевантные; `topics` фильтруется.

## Completion Notes

### Что сделано

- `question-bank.repository.ts`: добавлены `findProfessions()`, `findSkillsByProfession(companyId, professionId?)`, `findTopics(companyId, skillId?, professionId?)`.
  - «Скиллы профессии» вычисляются из данных: distinct `skills` через join `questions.profession_id` → `question_skills` → `skills` с visibility-фильтром вопросов (`company_id IS NULL OR company_id = ?`, `is_active = 1`, `deleted_at IS NULL`). Без `professionId` — все активные skills (глобальный lookup).
  - `findTopics`: фильтр по `topics.skill_id` и/или по профессии через `EXISTS` на видимых вопросах.
  - Новой таблицы `profession_skills` НЕ создавал (по design-doc).
- `question-bank.service.ts`: `listProfessions()`, `listSkills(companyId, professionId?)`, `listTopics(companyId, skillId?, professionId?)` + хелпер `parseOptionalId` (валидирует id). Переиспользованы существующие мапперы `mapProfessionToGraphql` / `mapSkillToGraphql` / `mapTopicToGraphql`.
- `question-bank.resolver.ts`: новые GraphQL queries `professions`, `skills(professionId: String)`, `topics(skillId: String, professionId: String)` (за `GqlAuthGuard`). Переиспользованы `ProfessionType` / `SkillType` / `TopicType`.
- Регенерирован `backend/src/schema.gql` (boot fresh-инстанса в dev): добавлены `professions: [ProfessionType!]!`, `skills(professionId: String): [SkillType!]!`, `topics(professionId: String, skillId: String): [TopicType!]!`.

### Команды / проверка

- `pnpm -C backend build` → OK (exit 0).
- targeted eslint на изменённых файлах → OK (autofix одного pre-existing prettier-переноса в `mapTopicWithSkill`).
- Поднят свежий backend на `PORT=4099` (dev), регистрация компании → токен, GraphQL smoke через `curl`:
  - `professions` → 1 запись (Frontend Developer) — непустой ✅
  - `skills` (без фильтра) → 20 активных скиллов ✅
  - `skills(professionId:"1")` → релевантные скиллы (выведены из вопросов профессии) ✅
  - `skills(professionId:"99999")` → `[]` (нет вопросов) ✅
  - `topics` → 564; `topics(skillId:"29")` → 73, все с `skill.code = docker` (фильтр сужает) ✅
  - `topics(skillId:"29", professionId:"1")` → 73 ✅

Ожидал непустые lookup'ы и корректную фильтрацию — получил ожидаемое.
