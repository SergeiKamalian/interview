# REST API на Express.js

- **topic_code:** `expressjs_rest_api`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-rest-api
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-rest-api.bank.json` → `pnpm seed:topic -- expressjs_rest_api`
- **status:** draft

## Вопрос

> Как построить REST API с Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rest_crud_mapping | HTTP-методы и CRUD | 2.0 | basic | ядро REST |
| 1 | express_json_setup | express.json() | 2.0 | basic | minimal example |
| 2 | reading_request_data | params/query/body | 1.5 | basic | reading request data |
| 3 | response_patterns | Корректные ответы | 1.5 | basic | 201/404/204 |
| 4 | router_modularity | express.Router | 1.5 | basic | modular routes |
| 5 | rest_api_mistakes | Типичные ошибки | 1.5 | intermediate | common mistakes |

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
