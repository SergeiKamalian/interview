# Связь контейнеров в Docker Compose

- **topic_code:** `docker_compose_container_communication`
- **source:** https://itlead.org/interview-questions/docker/docker-compose-container-communication
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-compose-container-communication.bank.json` → `pnpm seed:topic -- docker_compose_container_communication`
- **status:** draft

## Вопрос

> Как контейнеры общаются между собой в Docker Compose?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | default_network_dns | Дефолтная сеть и DNS по имени сервиса | 2.0 | core_plus | ядро — service name как hostname |
| 1 | compose_dns_mechanism | Механизм под капотом | 1.5 | basic | bridge, 127.0.0.11, project_default |
| 2 | localhost_mistake | localhost не работает между сервисами | 2.0 | intermediate | самая частая ошибка новичков |
| 3 | ports_vs_expose | ports vs expose vs внутренний доступ | 2.0 | intermediate | publish только для хоста |
| 4 | multiple_networks | Несколько сетей и изоляция | 1.5 | basic | three-tier frontend/backend |
| 5 | common_mistakes | Типичные ошибки и cross-project | 1.0 | basic | container name, external network |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
