# Зависимости сервисов в Docker Compose

- **topic_code:** `docker_compose_service_dependencies`
- **source:** https://itlead.org/interview-questions/docker/docker-compose-service-dependencies
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-compose-service-dependencies.bank.json` → `pnpm seed:topic -- docker_compose_service_dependencies`
- **status:** draft

## Вопрос

> Как управлять зависимостями сервисов в Docker Compose?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | depends_on_start_only | Понимает что plain depends_on — только порядок старта | 1.5 | core_plus | started ≠ ready — ядро TL;DR |
| 1 | service_healthy | Знает condition: service_healthy | 2.0 | core_plus | правильный дефолт для runtime deps |
| 2 | three_conditions | Знает три condition в depends_on | 1.5 | basic | started / healthy / completed_successfully |
| 3 | healthcheck_required | Понимает что dep нужен healthcheck | 1.5 | intermediate | ошибка без healthcheck на dep |
| 4 | migrate_init_pattern | Паттерн migrate / init one-shot | 2.0 | intermediate | service_completed_successfully |
| 5 | common_mistakes_retry | Типичные ошибки и app-level retry | 1.5 | intermediate | cyclic, restart, wait-for, external |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| service_healthy | depends_on_start_only | 0.45 |
| migrate_init_pattern | healthcheck_required | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
