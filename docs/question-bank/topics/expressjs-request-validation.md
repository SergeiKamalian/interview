# Валидация запросов в Express.js

- **topic_code:** `expressjs_request_validation`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-request-validation
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-request-validation.bank.json` → `pnpm seed:topic -- expressjs_request_validation`
- **status:** draft

## Вопрос

> Как валидировать данные запроса в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | validation_principles | Принципы валидации | 1.5 | core_plus | never trust client |
| 1 | zod_joi_libraries | Zod и Joi | 1.0 | basic | comparison table |
| 2 | validation_middleware | Validation middleware | 1.5 | intermediate | factory pattern |
| 3 | validate_all_inputs | body/params/query | 2.0 | intermediate | signup example |
| 4 | validation_order | Порядок в stack | 2.0 | intermediate | до async DB |
| 5 | advanced_validation | Nested и transform | 1.5 | basic | advanced arrays |
| 6 | validation_mistakes | Типичные ошибки | 0.5 | mention | common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe |
| formal strong | 7 – 9 | invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
