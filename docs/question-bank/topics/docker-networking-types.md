# Типы сетей Docker

- **topic_code:** `docker_networking_types`
- **source:** https://itlead.org/interview-questions/docker/docker-networking-types
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-networking-types.bank.json` → `pnpm seed:topic -- docker_networking_types`
- **status:** draft

## Вопрос

> Как работает Docker networking и какие типы сетей существуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | network_drivers_overview | Обзор шести встроенных драйверов | 1.5 | core_plus | ядро TL;DR — виртуальные сети, выбор по топологии |
| 1 | user_defined_bridge | User-defined bridge vs default bridge | 2.0 | core_plus | DNS по имени контейнера — главный практический выбор |
| 2 | bridge_host_none | Различает bridge, host и none | 1.5 | intermediate | изоляция namespace, NAT, когда host/none |
| 3 | overlay_multihost | Overlay для multi-host (Swarm) | 1.5 | intermediate | VXLAN, требует Swarm; K8s — CNI, не Docker overlay |
| 4 | embedded_dns | Встроенный DNS Docker | 1.0 | basic | 127.0.0.11, resolv.conf, резолв по имени |
| 5 | macvlan_ipvlan | macvlan и ipvlan на физическом LAN | 1.0 | basic | контейнер как устройство LAN; ограничения в cloud |
| 6 | common_mistakes | Типичные ошибки и отладка | 1.5 | intermediate | default bridge без DNS, host + -p, localhost, overlay без Swarm |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| user_defined_bridge | network_drivers_overview | 0.45 |
| common_mistakes | user_defined_bridge | 0.40 |

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
