# Статические файлы и compression в Express.js

- **topic_code:** `expressjs_static_files_compression`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-static-files-compression
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-static-files-compression.bank.json` → `pnpm seed:topic -- expressjs_static_files_compression`
- **status:** draft

## Вопрос

> Как обслуживать статические файлы и улучшить производительность в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | express_static | express.static() | 2.0 | basic | ядро TL;DR |
| 1 | compression_middleware | compression() | 2.0 | basic | gzip + порядок |
| 2 | caching_options | Кеширование static | 1.5 | basic | maxAge, etag |
| 3 | middleware_order_static | Порядок middleware | 2.0 | intermediate | static before API mistake |
| 4 | spa_production_setup | Production SPA | 1.5 | basic | dist + fallback |
| 5 | static_mistakes | Типичные ошибки | 1.0 | mention | common mistakes |

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
