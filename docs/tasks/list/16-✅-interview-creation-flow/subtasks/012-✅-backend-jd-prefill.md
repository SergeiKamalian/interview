# TASK-16.12 — Backend: JD → prefill resolver

Status: [x] done

## Goal

По тексту вакансии (JD) вернуть предзаполнение для визарда: profession, level, skills + подобранные questionIds.

## Depends on

- TASK-16.2, TASK-16.4.

## Context

- Принцип: AI классифицирует JD и ОТБИРАЕТ вопросы из банка (не создаёт новые).
- Результат НЕ создаёт интервью — только prefill.

## Scope

- Новый resolver/mutation, напр. `draftInterviewFromJobDescription(input: { jobDescription, language? })`.
- Сервис:
  - LLM → `{ professionId?, level?, skillIds[] }` (мэтчить на реальные справочники из 16.2; неузнанное игнорировать/предлагать ближайшее);
  - переиспользовать AI-подбор вопросов (16.4) → `questionIds`.
- Вернуть `{ title?, jobRole?, professionId?, level?, skillIds[], questionIds[] }` — всё как предложение для редактирования на фронте.
- Регенерация `backend/src/schema.gql`.

## Verification

- `pnpm -C backend build` + targeted eslint.
- GraphQL smoke: на реальном JD возвращает валидные (существующие) profession/skills/questionIds; на мусорном вводе — безопасный пустой/частичный результат без ошибок.

## Completion Notes

Новая mutation `draftInterviewFromJobDescription(input: { jobDescription, language?, count? })` → `JobDescriptionDraftPayload { title?, jobRole?, professionId?, level?, skillIds[], questionIds[], questions[], generatedByAi }`. НЕ создаёт интервью — только prefill.

Новые файлы (`question-bank`):
- `dto/draft-interview-from-job-description.input.ts`;
- `types/job-description-draft.type.ts`;
- `prompts/job-description-classification.prompt.ts` (key `jd_classification`) — LLM мэтчит JD на РЕАЛЬНЫЕ справочники (professions/skills из 16.2), отдаёт `{ professionId|null, level|null, skillIds[], title, jobRole }`;
- `job-description-draft.service.ts` — классификация + guard'ы (professionId только из списка, skillIds только существующие и сужены до скиллов профессии, level только из enum, title/jobRole обрезаются). Затем переиспользует `QuestionSuggestionService.suggest` (16.4) → `questionIds`/`questions`.

Guard'ы / fail-safe: LLM-ошибка или мусорный ввод → пустой/частичный draft без throw. Без profession вопросы не подбираются (questionIds=[]). Регистрация сервиса в `question-bank.module.ts`, mutation в `question-bank.resolver.ts` (под `GqlAuthGuard`). `backend/src/schema.gql` регенерирован (autoSchemaFile при старте dev).

### Команды / проверки

- `pnpm -C backend build` → exit 0.
- `eslint` по всем новым/изменённым файлам → чисто.
- `schema.gql`: присутствуют `DraftInterviewFromJobDescriptionInput`, `JobDescriptionDraftPayload`, `draftInterviewFromJobDescription`.
- GraphQL smoke (изолированный backend `PORT=4131`, dev MySQL, JWT company_id=1, OpenAI LLM):
  - реальный JD (frontend/react/TS) → `professionId=1`, `level=middle`, `skillIds=[3,2,4]` (реальные), 6 реальных `questionIds` из банка, `title`/`jobRole` предложены, `generatedByAi=true`;
  - мусорный ввод → все поля null, `skillIds=[]`, `questionIds=[]`, без ошибок.
