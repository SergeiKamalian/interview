# Blue-green deployment с Docker

- **topic_code:** `blue_green_deployment_docker`
- **source:** https://itlead.org/interview-questions/docker/blue-green-deployment-docker
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/blue-green-deployment-docker.bank.json` → `pnpm seed:topic -- blue_green_deployment_docker`
- **status:** draft

## Вопрос

> Как реализовать blue-green deployment с Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | bg_definition | Суть blue-green | 1.5 | core_plus | два полных окружения, атомарный cutover и rollback |
| 1 | docker_deploy_flow | Docker-пайплайн деплоя | 2.0 | intermediate | network, healthcheck, smoke-test, drain из ITLead steps |
| 2 | reverse_proxy_cutover | Cutover через reverse proxy | 1.5 | core_plus | nginx upstream / Traefik labels — атомарное переключение |
| 3 | state_expand_contract | Expand-then-contract для схемы БД | 1.5 | core_plus | backward-compatible schema при overlap blue и green |
| 4 | state_sessions_caches | State: сессии, файлы, кеш | 0.5 | mention | in-memory state не переживает cutover |
| 5 | deploy_variants | Blue-green vs canary vs rolling | 1.0 | basic | бинарный cutover vs постепенный vs rolling |
| 6 | common_mistakes | Типичные ошибки | 1.5 | intermediate | schema-breaking, нет rollback-теста, ручной cutover |
| 7 | rollback_monitoring | Rollback и мониторинг | 0.5 | mention | playbook rollback, метрики первые 5–10 минут |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| docker_deploy_flow | bg_definition | 0.45 |
| state_expand_contract | common_mistakes | 0.40 |
| reverse_proxy_cutover | docker_deploy_flow | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
