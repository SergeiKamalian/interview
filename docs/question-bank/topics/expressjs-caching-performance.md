# Кеширование и производительность в Express.js

- **topic_code:** `expressjs_caching_performance`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-caching-performance
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-caching-performance.bank.json` → `pnpm seed:topic -- expressjs_caching_performance`
- **status:** draft

## Вопрос

> Как реализовать кеширование в Express.js для повышения производительности?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cache_layers | Три слоя кеширования | 1.5 | core_plus | TL;DR три слоя |
| 1 | memory_vs_redis | In-memory vs Redis | 2 | intermediate | ключевой senior trade-off |
| 2 | cache_middleware | Паттерн cache middleware | 1.5 | core_plus | middleware pattern из ITLead |
| 3 | http_cache_headers | HTTP Cache-Control и ETag | 1.5 | core_plus | client-side cache layer |
| 4 | cache_invalidation | Инвалидация кеша | 2 | intermediate | invalidation — главный production риск |
| 5 | what_to_cache | Что кешировать и что нет | 1 | basic | границы кеширования |
| 6 | common_mistakes | Типичные ошибки кеширования | 0.5 | mention | bonus pitfalls |

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
