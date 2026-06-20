# TASK-16.3 — Backend: фильтр skillIds + skills-first ordering

Status: [x] done

## Goal

Дать возможность фильтровать/ранжировать вопросы по выбранным скиллам для шага 2 (skills-first).

## Depends on

- TASK-16.2.

## Context

- Сейчас `QuestionBankFilterInput` поддерживает `professionId`, `topicId`, `level`, `difficulty`, `search`, `limit`, `offset` (`backend/src/modules/question-bank/dto/question-filter.input.ts`).
- Фильтра по skill НЕТ. Связь вопрос↔скилл — M2M `question_skills`.

## Scope

- `backend/src/modules/question-bank/dto/question-filter.input.ts`: добавить `skillIds: [String!]` (optional).
- `backend/src/modules/question-bank/question-bank.repository.ts` (`buildFilterClause`): join/EXISTS по `question_skills` для `skillIds`.
- Skills-first ordering: либо optional sort на стороне сервера (вопросы с совпадением skill выше), либо документировать, что ordering делается на клиенте. Зафиксировать выбранный вариант в Completion Notes.
- Регенерация `backend/src/schema.gql`.

## Verification

- `pnpm -C backend build` + targeted eslint.
- GraphQL smoke: `questionBank(filters:{ skillIds:[...] })` возвращает только вопросы с этими скиллами; без `skillIds` поведение не меняется (регрессия).

## Completion Notes

### Что сделано

- `dto/question-filter.input.ts`: добавлено опциональное поле `skillIds: [String!]` (валидация `@IsArray` + `@ArrayMaxSize(100)` + `@IsString({ each: true })`).
- `question-bank.repository.ts` (`buildFilterClause`): для `skillIds` добавлен `EXISTS (SELECT 1 FROM question_skills qs WHERE qs.question_id = q.id AND qs.skill_id IN (...))`. Семантика **OR** (вопрос матчится, если содержит хотя бы один из выбранных скиллов). Id парсятся в числа и фильтруются (`Number.isInteger && > 0`); пустой/мусорный массив игнорируется (поведение не меняется).
- Регенерирован `backend/src/schema.gql` — `QuestionBankFilterInput.skillIds: [String!]`.

### Выбранный вариант skills-first ordering

`skillIds` = серверный **фильтр** (EXISTS, OR-семантика). Server-side ordering оставлен прежним (`q.updated_at DESC`); **skills-first ordering выполняется на клиенте** (frontend уже имеет `groupQuestionsBySkill.ts` для шага 2). Причина: серверный буст усложнил бы count/list-запросы, а при активном `skillIds`-фильтре все результаты уже релевантны; группировка/приоритет по выбранным скиллам — UX-концерн клиента. Зафиксировано здесь как принятое решение.

### Команды / проверка

- `pnpm -C backend build` → OK.
- targeted eslint (`dto/question-filter.input.ts`, `question-bank.repository.ts`) → OK.
- GraphQL smoke (`curl`, backend dev на :4099):
  - baseline без `skillIds` → `total = 564` (регрессия: поведение не изменилось) ✅
  - `skillIds:["29"]` (docker) → `total = 73`, у всех вернувшихся вопросов есть skill `29` ✅
  - `skillIds:["29","3"]` → `total = 160` (OR: больше, чем по одному скиллу, меньше полного набора) ✅
  - `skillIds:["99999"]` → `total = 0` ✅
