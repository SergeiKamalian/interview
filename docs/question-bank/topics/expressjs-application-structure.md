# Структура большого Express.js приложения

- **topic_code:** `expressjs_application_structure`
- **source:** https://itlead.org/interview-questions/expressjs/expressjs-application-structure
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/expressjs-application-structure.bank.json` → `pnpm seed:topic -- expressjs_application_structure`
- **status:** draft

## Вопрос

> Как структурировать большое Express.js приложение?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | layered_architecture | Слоистая архитектура | 2.0 | core_plus | routes/controllers/services/models |
| 1 | app_vs_server | app.js vs server.js | 1.5 | core_plus | listen split for supertest |
| 2 | request_flow | Flow запроса | 1.5 | intermediate | router → controller → service |
| 3 | layer_responsibilities | Ответственность слоёв | 1.5 | intermediate | HTTP vs business logic |
| 4 | when_add_layers | Когда добавлять слои | 0.5 | basic | 10/50 routes thresholds |
| 5 | testing_strategy | Тестирование | 1.0 | intermediate | unit mock, supertest |
| 6 | common_mistakes | Типичные ошибки | 1.5 | intermediate | global auth, logic in routes |
| 7 | monorepo_boundaries | Domain boundaries | 0.5 | expert | bounded context folders |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| app_vs_server | layered_architecture | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
