# Объекты req и res в Express.js

- **topic_code:** `expressjs_req_res_object`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-req-res-object
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-req-res-object.bank.json` → `pnpm seed:topic -- expressjs_req_res_object`
- **status:** draft

## Вопрос

> Что такое объекты req и res в Express.js и как их использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | req_data_sources | Знает что хранит req | 2.0 | basic | ядро TL;DR — params/query/body |
| 1 | res_response_methods | Знает методы res | 2.0 | basic | toolkit ответа |
| 2 | body_parser_order | Порядок express.json() | 2.0 | intermediate | частая junior ошибка |
| 3 | req_res_conventions | Конвенции req/res | 1.5 | basic | read-only/write-only, locals |
| 4 | when_to_use_req_res | Выбор свойства | 1.5 | basic | when to use ITLead |
| 5 | common_mistakes_req_res | Типичные ошибки | 1.0 | mention | double response, parser |

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
