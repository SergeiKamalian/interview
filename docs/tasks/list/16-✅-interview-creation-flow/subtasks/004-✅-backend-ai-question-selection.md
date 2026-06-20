# TASK-16.4 — Backend: AI-подбор вопросов из банка

Status: [x] done

## Goal

Кнопка «Сгенерировать вопросы через AI»: AI ПОДБИРАЕТ из банка оптимальный набор под профессию/скиллы/уровень. Ничего не выдумывает.

## Depends on

- TASK-16.2, TASK-16.3.

## Context

- Принцип «банк = source of truth»: LLM только ранжирует/отбирает существующие вопросы и возвращает `questionIds`.
- AI-генерации сейчас нет. Visibility вопросов — `question-bank.schema.ts`.

## Scope

- `backend/src/modules/question-bank/` (или новый сервис рядом): resolver/mutation, напр. `suggestInterviewQuestions(input)` где input = `{ professionId, level, skillIds, count }`.
- Сервис:
  - выбирает кандидатов из банка по фильтрам (переиспользовать repository из 16.2/16.3);
  - LLM ранжирует/отбирает набор (учитывая разнообразие тем, сложность, веса);
  - возвращает упорядоченные `questionIds` (только реально существующие, видимые компании).
- Guard: ответ LLM фильтруется — выкидывать любые id, которых нет в наборе кандидатов.
- Использовать существующую LLM-инфраструктуру (см. `backend/src/modules/adaptive-interview/` / общий OpenAI provider).
- Регенерация `backend/src/schema.gql`.

## Verification

- `pnpm -C backend build` + targeted eslint.
- GraphQL smoke: `suggestInterviewQuestions` возвращает только id из банка; при пустом банке — пустой/безопасный результат.
- Негатив: подмешанные «несуществующие» id не попадают в ответ (guard).

## Completion Notes

### Что сделано

- Новая GraphQL mutation `suggestInterviewQuestions(input: SuggestInterviewQuestionsInput!): SuggestedInterviewQuestionsPayload!` (за `GqlAuthGuard`).
  - `dto/suggest-interview-questions.input.ts`: `{ professionId!, level?, skillIds?, count? (1..50, default 10) }`.
  - `types/suggested-questions.type.ts`: payload `{ questionIds, questions, count, candidateCount, generatedByAi }`.
- `question-suggestion.service.ts` (новый, в модуле question-bank, провайдер в `question-bank.module.ts`):
  1. валидирует `professionId` (через `findProfessionById`, иначе `PROFESSION_NOT_FOUND`);
  2. тянет кандидатов из банка `repository.findSuggestionCandidates()` (visibility policy: `company_id IS NULL OR company_id = ?`, `is_active`, не удалён; фильтры profession/level/skillIds(OR); pool = `count*8`, в пределах 60..300, ORDER BY `interview_weight DESC, id ASC`);
  3. при пустом банке → безопасный пустой результат (LLM не вызывается);
  4. LLM (`AiProviderService.evaluateJson`, prompt `prompts/question-suggestion.prompt.ts`) ранжирует/отбирает набор — учитывает разнообразие тем, прогрессию сложности, веса; возвращает `{ questionIds }`;
  5. **Guard**: `parseAndGuardSelection` оставляет только id из набора кандидатов (Set), выкидывает несуществующие/дубли, кап до `count`, сохраняет порядок;
  6. если LLM упал/вернул мусор → детерминированный topic-diverse fallback (`generatedByAi=false`);
  7. финально маппит выбранные id в полные `QuestionType` (через `QuestionBankService.getById`), порядок сохранён.
- `AiProviderService` глобальный (`@Global()`) — отдельный импорт в модуль не нужен.
- Принцип «банк = source of truth» соблюдён: AI только ОТБИРАЕТ существующие видимые вопросы и возвращает реальные `questionIds`; новые вопросы не создаёт.
- Регенерирован `backend/src/schema.gql`.

### Команды / проверка

- `pnpm -C backend build` → OK.
- targeted eslint на всех изменённых/новых файлах question-bank → OK.
- Unit-тест `question-suggestion.service.spec.ts` (jest) → 5/5 passed:
  - **guard negative**: AI вернул `[999, "102", "abc", "101"]` → результат `["102","101"]` (несуществующие `999`/`"abc"` выброшены) ✅
  - кап до `count` + дедуп ✅
  - пустой банк → безопасный пустой результат, LLM не вызывался ✅
  - AI упал → детерминированный topic-diverse fallback (`generatedByAi=false`) ✅
  - невалидный `professionId` → `BadRequestException` ✅
- GraphQL smoke (`curl`, backend dev на :4099, реальный LLM `gpt-5.4-nano`):
  - `suggestInterviewQuestions(professionId:"1", level: junior, count: 6)` → `generatedByAi=true`, candidateCount=60, 6 вопросов, все `junior`, разные темы, `questionIds` совпадают с порядком `questions` ✅
  - `professionId:"1", skillIds:["29"](docker), count: 8` → все 8 вернувшихся имеют skill `docker` (отбор строго из подмножества кандидатов — подтверждает guard на реальных данных) ✅
  - `professionId:"1", skillIds:["99999"]` → пустой безопасный результат (count 0, candidateCount 0, `generatedByAi=false`) ✅
  - `professionId:"99999"` → ошибка `PROFESSION_NOT_FOUND` ✅

Ожидал: только реальные id из банка, безопасную обработку пустого банка и отсев несуществующих id. Получил ожидаемое во всех случаях.
