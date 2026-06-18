# Оптимизация производительности Express.js

- **topic_code:** `expressjs_performance_optimization`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-performance-optimization
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-performance-optimization.bank.json` → `pnpm seed:topic -- expressjs_performance_optimization`
- **status:** draft

## Вопрос

> Как оптимизировать производительность Express.js приложения?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | production_basics | Production + compression | 1.5 | core_plus | env + gzip |
| 1 | cluster_scaling | Cluster scaling | 1.5 | intermediate | workers per CPU |
| 2 | redis_caching | Redis cache | 2.0 | intermediate | cache-aside |
| 3 | connection_pooling | Connection pooling | 1.5 | intermediate | pg.Pool |
| 4 | streaming_responses | Streaming | 1.5 | intermediate | large exports |
| 5 | async_event_loop | Event loop | 1.0 | basic | async handlers |
| 6 | body_limits_dos | Body limits | 0.5 | mention | DoS protection |
| 7 | performance_mistakes | Типичные ошибки | 0.5 | mention | common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
