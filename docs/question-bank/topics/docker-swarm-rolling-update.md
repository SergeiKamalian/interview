# Rolling update в Docker Swarm

- **topic_code:** `docker_swarm_rolling_update`
- **source:** https://itlead.org/interview-questions/docker/docker-swarm-rolling-update
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-swarm-rolling-update.bank.json` → `pnpm seed:topic -- docker_swarm_rolling_update`
- **status:** draft

## Вопрос

> Как выполнить rolling update в Docker Swarm?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rolling_update_basics | Понимает rolling update в Swarm | 1.5 | core_plus | TL;DR — service update, батчи, трафик на healthy |
| 1 | update_config_params | Знает ключевые параметры update_config | 1.5 | core_plus | parallelism, delay, monitor, failure-action, max_failure_ratio |
| 2 | update_order | Различает stop-first и start-first | 2.0 | intermediate | zero-downtime vs краткий gap, overlap версий |
| 3 | healthcheck_gating | Понимает health-driven gating | 1.5 | intermediate | healthcheck обязателен для безопасного rollout |
| 4 | rollback_mechanism | Знает rollback и rollback_config | 2.0 | intermediate | manual rollback, auto rollback, отличие от update_config |
| 5 | common_mistakes | Типичные ошибки rolling update | 1.5 | intermediate | без healthcheck, высокий parallelism, latest, нет rollback_config |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| update_order | rolling_update_basics | 0.4 |
| rollback_mechanism | update_config_params | 0.35 |
| common_mistakes | healthcheck_gating | 0.4 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
