# CORS в Express.js

- **topic_code:** `expressjs_cors`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-cors
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-cors.bank.json` → `pnpm seed:topic -- expressjs_cors`
- **status:** draft

## Вопрос

> Что такое CORS и как настроить его в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cors_basics | Понимает CORS и origin | 2 | intermediate | ядро CORS |
| 1 | preflight | Preflight OPTIONS | 1.5 | core_plus | Authorization triggers preflight |
| 2 | cors_package | Настройка пакета cors | 2 | intermediate | express cors config |
| 3 | credentials_wildcard | credentials и wildcard | 1.5 | core_plus | частая production ошибка |
| 4 | multi_origin | Несколько origin | 1 | basic | dynamic origin |
| 5 | common_mistakes | Типичные ошибки CORS | 2 | intermediate | Stack Overflow classics |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
