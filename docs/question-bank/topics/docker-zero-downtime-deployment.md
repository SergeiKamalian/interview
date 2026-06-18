# Zero-downtime deployment с Docker

- **topic_code:** `docker_zero_downtime_deployment`
- **source:** https://itlead.org/interview-questions/docker/docker-zero-downtime-deployment
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-zero-downtime-deployment.bank.json` → `pnpm seed:topic -- docker_zero_downtime_deployment`
- **status:** draft

## Вопрос

> Какие есть подходы к zero-downtime deployment с Docker в production?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | zero_downtime_definition | Суть zero-downtime | 1.0 | basic | определение + cross-cutting: healthcheck, graceful shutdown, migrations, draining |
| 1 | deploy_strategies | Rolling, blue-green, canary | 2.0 | intermediate | три семейства стратегий и trade-offs из ITLead TL;DR |
| 2 | healthchecks_readiness | Healthcheck и readiness | 1.5 | core_plus | liveness vs readiness; LB не шлёт трафик до готовности |
| 3 | graceful_shutdown | Graceful shutdown | 2.0 | intermediate | SIGTERM → drain in-flight → exit; stop_grace_period |
| 4 | db_migrations_expand_contract | Expand-then-contract для БД | 1.5 | core_plus | backward-compatible schema при overlap версий |
| 5 | connection_draining | Connection draining | 1.0 | basic | stop_grace_period + WebSocket/gRPC reconnect |
| 6 | common_mistakes | Типичные ошибки | 1.0 | basic | TCP-only healthcheck, SIGTERM ignored, sticky sessions, rollback |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| deploy_strategies | zero_downtime_definition | 0.45 |
| graceful_shutdown | healthchecks_readiness | 0.40 |
| db_migrations_expand_contract | common_mistakes | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
