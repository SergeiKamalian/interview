# Масштабирование сервисов в Docker Compose

- **topic_code:** `docker_compose_scale_services`
- **source:** https://itlead.org/interview-questions/docker/docker-compose-scale-services
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-compose-scale-services.bank.json` → `pnpm seed:topic -- docker_compose_scale_services`
- **status:** draft

## Вопрос

> Как масштабировать сервисы в Docker Compose?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | scale_mechanisms | `--scale` и `deploy.replicas` | 1.5 | core_plus | два способа задать число реплик из ITLead TL;DR |
| 1 | single_host_scope | Ограничение single-host | 1.0 | basic | все реплики на одной машине — ключевой scope Compose |
| 2 | dns_load_balancing | DNS и round-robin | 1.5 | intermediate | embedded DNS возвращает все IP реплик |
| 3 | port_conflict_expose | Конфликт портов и `expose` | 2.0 | intermediate | главная production-ловушка при scale |
| 4 | reverse_proxy_pattern | Reverse proxy перед репликами | 1.5 | core_plus | nginx/Traefik + internal-only replicas |
| 5 | compose_limitations | Что Compose scaling не делает | 1.5 | intermediate | нет HA, auto-scale, health-aware LB |
| 6 | common_mistakes | Типичные ошибки | 1.0 | basic | stateful scale, `--scale` не персистит, idempotency workers |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| port_conflict_expose | scale_mechanisms | 0.40 |
| reverse_proxy_pattern | port_conflict_expose | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
