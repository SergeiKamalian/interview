# TASK-16.13 — Frontend: hooks professions/skills/topics

Status: [x] done

## Goal

Дать визарду RTK Query хуки для справочников.

## Depends on

- TASK-16.2.

## Context

- Сейчас professions/skills/topics отдельно на фронте не фетчатся (только вложенно в вопросах).
- FE data layer — RTK Query + GraphQL.

## Scope

- `.graphql` operations: `Professions`, `Skills($professionId)`, `Topics($skillId,$professionId)` в `frontend/src/shared/api/graphql/operations/`.
- Регистрация в `operations.registry.ts`; кодоген типов (`generated/graphql.ts`, `gql.ts`).
- Hooks в `frontend/src/features/question-bank/api/questionBankApi.ts`: `useProfessionsQuery`, `useSkillsQuery`, `useTopicsQuery`.

## Verification

- `pnpm -C frontend build` (или typecheck) + lint изменённых файлов.
- Кодоген проходит; хуки типизированы; ручной запрос в UI/devtools возвращает данные.

## Completion Notes

Новые `.graphql` operations в `frontend/src/shared/api/graphql/operations/`: `professions.graphql` (`Professions`), `skills.graphql` (`Skills($professionId)`), `topics.graphql` (`Topics($skillId,$professionId)`).

Кодоген (`pnpm graphql:sync` = codegen + registry) перегенерировал `generated/graphql.ts` (типы `ProfessionsQuery`/`SkillsQuery`/`TopicsQuery` + Variables) и `operations.registry.ts` (40 операций).

Hooks в `frontend/src/features/question-bank/api/questionBankApi.ts`: `useProfessionsQuery`, `useSkillsQuery({ professionId? })`, `useTopicsQuery({ skillId?, professionId? })` + экспортируемые типы `Profession`/`Skill`/`Topic`. providesTags `QuestionBank` (refetch вместе с банком).

### Команды / проверки

- `pnpm graphql:sync` → codegen ok, registry 40 operations.
- `tsc -b` → exit 0 (хуки типизированы).
- `eslint` по `questionBankApi.ts` → чисто.
- Runtime smoke против backend (`PORT=4131`, JWT company_id=1): `professions` → Frontend Developer; `skills(professionId:1)` → реальный список (Angular, CSS, React, Docker…); `topics(professionId:1)` → темы с `interviewWeight` + `skill`.
