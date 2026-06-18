# Middleware в Express.js

- **topic_code:** `express_middleware_explained`
- **source:** https://itlead.org/interview-questions/expressjs/express-middleware-explained
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/express-middleware-explained.bank.json` → `pnpm seed:topic -- express_middleware_explained`
- **status:** draft

## Вопрос

> Что такое middleware в Express.js и как он работает?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | middleware_definition | Что такое middleware | 2.0 | core_plus | req/res/next, chain |
| 1 | next_chain | Механика next() | 1.5 | core_plus | continue vs end vs next(err) |
| 2 | middleware_stack_order | Порядок stack | 1.5 | intermediate | app vs router order |
| 3 | error_middleware | Error middleware | 2.0 | intermediate | 4 args, register last |
| 4 | async_express4 | Async Express 4 | 1.5 | intermediate | try/catch, asyncHandler |
| 5 | common_mistakes | Типичные ошибки | 1.0 | mention | double next, blocking I/O |
| 6 | real_world_libs | Production libs | 0.5 | mention | helmet, morgan, passport |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
