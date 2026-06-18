# Обработка ошибок в Express.js

- **topic_code:** `expressjs_error_handling`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-error-handling
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-error-handling.bank.json` → `pnpm seed:topic -- expressjs_error_handling`
- **status:** draft

## Вопрос

> Как правильно обрабатывать ошибки в Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | sync_vs_async_errors | Sync vs async ошибки | 2 | intermediate | главный middle insight |
| 1 | error_middleware | Error middleware 4 params | 2 | intermediate | signature и порядок |
| 2 | async_handler_pattern | asyncHandler | 1.5 | core_plus | DRY async errors |
| 3 | custom_errors | Custom error classes | 1.5 | core_plus | structured errors at scale |
| 4 | not_found_404 | 404 catch-all | 1 | basic | unmatched routes |
| 5 | production_handling | Production error responses | 2 | intermediate | security and UX |

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
