# Express Router и модульная маршрутизация

- **topic_code:** `expressjs_router`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-router
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-router.bank.json` → `pnpm seed:topic -- expressjs_router`
- **status:** draft

## Вопрос

> Что такое Express Router и как использовать его для модульной маршрутизации?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | router_definition | express.Router() | 2.0 | basic | ядро TL;DR |
| 1 | relative_paths | Относительные пути | 2.0 | basic | /users/users mistake |
| 2 | router_middleware | Router-level middleware | 1.5 | basic | auth на группу |
| 3 | nested_routers | Nested + mergeParams | 1.5 | intermediate | advanced ITLead |
| 4 | when_use_router | Когда использовать | 1.5 | basic | when to use |
| 5 | router_mistakes | Типичные ошибки | 1.5 | intermediate | common mistakes |

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
