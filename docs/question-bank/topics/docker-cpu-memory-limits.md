# Лимиты CPU и памяти в Docker

- **topic_code:** `docker_cpu_memory_limits`
- **source:** https://itlead.org/interview-questions/docker/docker-cpu-memory-limits
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-cpu-memory-limits.bank.json` → `pnpm seed:topic -- docker_cpu_memory_limits`
- **status:** draft

## Вопрос

> Как ограничить ресурсы контейнера (CPU и память)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cgroups_overview | Понимает cgroups и дефолт | 1.5 | core_plus | ядро TL;DR — Linux cgroups, без лимитов контейнер может съесть весь хост |
| 1 | memory_limits | Знает лимиты памяти | 2.0 | intermediate | hard cap, OOM-kill, exit 137, memory-swap |
| 2 | cpu_limits | Знает лимиты CPU | 2.0 | intermediate | --cpus throttle vs cpu-shares, cpuset-cpus |
| 3 | compose_resources | Знает синтаксис Compose | 1.0 | basic | deploy.resources.limits/reservations |
| 4 | limits_vs_reservations | Различает limit и reservation | 1.0 | basic | hard cap vs гарантированный минимум, Swarm placement |
| 5 | monitoring_update | Мониторинг и docker update | 1.0 | basic | docker stats, inspect, hot-update без рестарта |
| 6 | common_mistakes | Знает типичные ошибки | 1.5 | core_plus | prod без лимитов, JVM не видит cgroup, cpu-shares ≠ cpus |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| memory_limits | cgroups_overview | 0.40 |
| cpu_limits | cgroups_overview | 0.40 |
| common_mistakes | memory_limits | 0.35 |

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
