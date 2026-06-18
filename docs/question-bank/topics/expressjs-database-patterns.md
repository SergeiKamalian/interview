# Паттерны интеграции БД в Express.js

- **topic_code:** `expressjs_database_patterns`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-database-patterns
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-database-patterns.bank.json` → `pnpm seed:topic -- expressjs_database_patterns`
- **status:** draft

## Вопрос

> Какие паттерны интеграции базы данных лучше использовать в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | pattern_layers | Repository vs Service vs routes | 2 | intermediate | архитектурное ядро |
| 1 | connection_pool | Connection pool | 1.5 | core_plus | pool обязателен в production |
| 2 | dependency_injection | DI repository | 1 | basic | testability |
| 3 | transactions | Транзакции | 2 | intermediate | multi-step writes |
| 4 | orm_vs_raw | ORM vs raw SQL | 1.5 | core_plus | trade-off choice |
| 5 | common_mistakes | Типичные ошибки БД | 2 | intermediate | production pitfalls |

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
