# EXPOSE в Dockerfile vs публикация порта

- **topic_code:** `dockerfile_expose_vs_publish_port`
- **source:** https://itlead.org/interview-questions/docker/dockerfile-expose-vs-publish-port
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/dockerfile-expose-vs-publish-port.bank.json` → `pnpm seed:topic -- dockerfile_expose_vs_publish_port`
- **status:** draft

## Вопрос

> В чём разница между EXPOSE в Dockerfile и публикацией порта (`-p` / `--publish`)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | expose_vs_publish_core | EXPOSE vs `-p` — главное отличие | 2.0 | core_plus | TL;DR ITLead: metadata vs реальный NAT |
| 1 | what_expose_does | Что делает EXPOSE | 1.5 | basic | metadata, docker inspect, зависимость `-P` |
| 2 | what_p_does | Что делает `-p` / `--publish` | 2.0 | intermediate | iptables DNAT, docker-proxy, синтаксис HOST:CONTAINER |
| 3 | publish_all_flag | Флаг `-P` (publish-all) | 1.0 | basic | случайные host-порты, docker port |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | EXPOSE без `-p`, перевёрнутый `-p`, security |
| 5 | inter_container_compose | Межконтейнерный доступ и Compose | 1.5 | basic | сеть без `-p`; expose vs ports в Compose |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
