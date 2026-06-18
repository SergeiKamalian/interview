# Health check Docker-контейнера

- **topic_code:** `docker_container_healthcheck`
- **source:** https://itlead.org/interview-questions/docker/docker-container-healthcheck
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-container-healthcheck.bank.json` → `pnpm seed:topic -- docker_container_healthcheck`
- **status:** draft

## Вопрос

> Как настроить health check для Docker-контейнера?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | healthcheck_definition | Что такое healthcheck и три состояния | 1.5 | core_plus | PID 1 жив ≠ приложение работает |
| 1 | healthcheck_setup | Настройка и четыре флага | 1.5 | core_plus | Dockerfile / run / Compose + interval/timeout/retries/start_period |
| 2 | compose_test_forms | Формы test: CMD, CMD-SHELL, NONE | 1.0 | basic | exec vs shell vs отключение наследованного |
| 3 | depends_on_service_healthy | depends_on: service_healthy | 2.0 | intermediate | главный практический кейс Compose |
| 4 | command_not_found | Команда не найдена в образе | 1.5 | intermediate | alpine без curl — самая частая ошибка |
| 5 | common_mistakes | Типичные ошибки healthcheck | 2.0 | intermediate | start_period, зависимости в check, внешний URL |
| 6 | inspect_and_usage | inspect, логи и orchestration | 0.5 | mention | docker inspect Health.Log, Swarm/Traefik |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
