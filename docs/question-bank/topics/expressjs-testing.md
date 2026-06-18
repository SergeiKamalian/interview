# Тестирование Express.js приложений

- **topic_code:** `expressjs_testing`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-testing
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-testing.bank.json` → `pnpm seed:topic -- expressjs_testing`
- **status:** draft

## Вопрос

> Как тестировать Express.js приложение?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | app_export_pattern | app.js vs server.js | 2.0 | core_plus | #1 mistake — no listen |
| 1 | supertest_usage | Supertest | 1.5 | core_plus | HTTP integration |
| 2 | unit_vs_integration | Unit vs integration | 1.5 | intermediate | when each |
| 3 | test_db_strategy | Test database | 1.5 | intermediate | isolation + cleanup |
| 4 | mocking_auth_errors | Auth и errors | 1.5 | intermediate | mock service |
| 5 | testing_middleware | Middleware tests | 1.5 | basic | mini app |
| 6 | testing_mistakes | Типичные ошибки | 0.5 | mention | listen in app.js |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| unit_vs_integration | app_export_pattern | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
