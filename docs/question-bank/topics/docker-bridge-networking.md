# Docker Bridge Networking

- **topic_code:** `docker_bridge_networking`
- **source:** https://itlead.org/interview-questions/docker/docker-bridge-networking
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-bridge-networking.bank.json` → `pnpm seed:topic -- docker_bridge_networking`
- **status:** draft

## Вопрос

> Как работает bridge networking в Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | bridge_basics | Что такое bridge networking | 1.5 | core_plus | ядро — Linux bridge, docker0, приватная подсеть |
| 1 | veth_architecture | Архитектура veth-пары | 1.5 | core_plus | eth0 ↔ veth ↔ bridge — базовый механизм |
| 2 | container_to_container | Трафик между контейнерами | 1.5 | intermediate | L2 forwarding на одном bridge, без NAT |
| 3 | outbound_masquerade | Исходящий трафик и MASQUERADE | 1.5 | intermediate | NAT наружу, conntrack на обратный путь |
| 4 | port_publishing_dnat | Публикация портов `-p` / DNAT | 1.0 | basic | DNAT host:port → container IP |
| 5 | default_vs_user_bridge | Default bridge vs user-defined | 2.0 | intermediate | DNS 127.0.0.11, изоляция, docker0 без DNS |
| 6 | common_mistakes_debug | Типичные ошибки и отладка | 1.0 | basic | имя с хоста, разные bridge, iptables flush |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| default_vs_user_bridge | bridge_basics | 0.45 |
| outbound_masquerade | port_publishing_dnat | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| — | — | — | — | — | — | не запускался |
