# Route parameters и query strings

- **topic_code:** `express_route_parameters`
- **source:** https://itlead.org/interview-questions/expressjs/express-route-parameters
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/express-route-parameters.bank.json` → `pnpm seed:topic -- express_route_parameters`
- **status:** draft

## Вопрос

> Route parameters и query strings в Express — в чём разница?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | params_vs_query | params vs query | 2.0 | core_plus | req.params vs req.query |
| 1 | when_to_use | Когда что использовать | 1.5 | basic | resource id vs filter |
| 2 | string_parsing | Парсинг строк | 1.5 | basic | parseInt, string values |
| 3 | path_matching_internals | path-to-regexp | 1.5 | intermediate | matching internals |
| 4 | repeated_query_keys | Repeated keys | 1.5 | intermediate | array vs string normalize |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | req.query.id bug |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
