# JWT (JSON Web Tokens)

- **topic_code:** `jwt_json_web_tokens_explained`
- **source:** https://itlead.org/interview-questions/general/jwt-json-web-tokens-explained
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/jwt-json-web-tokens-explained.bank.json` → `pnpm seed:topic -- jwt_json_web_tokens_explained`
- **status:** ready

## Вопрос

> Что такое JWT и как работает аутентификация на JWT?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | jwt_structure | Знает структуру JWT | 1.5 | core_plus | JWT structure |
| 1 | signature_verify | Понимает подпись и verify | 2 | intermediate | signature core security |
| 2 | jwt_vs_sessions | Сравнивает JWT и sessions | 1.5 | core_plus | key difference sessions |
| 3 | when_to_use_jwt | Выбирает когда JWT | 1 | basic | when to use |
| 4 | common_mistakes | Знает типичные ошибки JWT | 2 | intermediate | common mistakes |
| 5 | hs256_vs_rs256 | Отличает HS256 и RS256 | 2 | intermediate | HS256 vs RS256 follow-up |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
