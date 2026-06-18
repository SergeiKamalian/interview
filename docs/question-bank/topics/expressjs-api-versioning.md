# Версионирование API в Express.js

- **topic_code:** `expressjs_api_versioning`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-api-versioning
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-api-versioning.bank.json` → `pnpm seed:topic -- expressjs_api_versioning`
- **status:** draft

## Вопрос

> Как реализовать версионирование API в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | versioning_need | Зачем versioning | 1.5 | core_plus | breaking changes parallel |
| 1 | url_path_versioning | URL path | 1.5 | core_plus | /api/v1, /api/v2 routers |
| 2 | header_versioning | Header/query strategies | 1.5 | intermediate | Accept-Version, Vary |
| 3 | shared_services_layer | Shared services | 2.0 | intermediate | version interface not domain |
| 4 | deprecation_headers | Deprecation | 1.5 | intermediate | Sunset, Deprecation headers |
| 5 | semver_middleware | Semver middleware | 1.0 | advanced | semver.satisfies routing |
| 6 | common_mistakes | Типичные ошибки | 0.5 | mention | shared handler, non-breaking |
| 7 | scale_many_versions | Много версий | 0.5 | expert | dynamic loader, max 2 active |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| url_path_versioning | versioning_need | 0.45 |
| deprecation_headers | url_path_versioning | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
