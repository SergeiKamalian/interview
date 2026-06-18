# Async/await в обработчиках Express.js

- **topic_code:** `expressjs_async_handling`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-async-handling
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-async-handling.bank.json` → `pnpm seed:topic -- expressjs_async_handling`
- **status:** draft

## Вопрос

> Как правильно обрабатывать async/await в route handlers Express.js?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | async_rejection_problem | Понимает проблему async rejections | 2 | intermediate | ядро — почему async ломает встроенную обработку ошибок |
| 1 | async_handler_wrapper | Знает паттерн asyncHandler | 2 | intermediate | основной fix — catch(next) на цепочке Promise |
| 2 | try_catch_vs_wrapper | Различает try/catch и asyncHandler | 1 | basic | когда трансформировать ошибку вручную |
| 3 | middleware_and_alternatives | Оборачивает async middleware; знает альтернативы | 1.5 | core_plus | частая ошибка — обернуть routes, забыть middleware |
| 4 | fire_and_forget | Знает про fire-and-forget Promise | 1.5 | core_plus | sendEmail без await — типичный production баг |
| 5 | common_mistakes | Типичные ошибки async в Express | 2 | intermediate | mistakes из ITLead — частые на middle+ |

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
