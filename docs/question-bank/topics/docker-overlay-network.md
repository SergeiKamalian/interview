# Docker overlay network

- **topic_code:** `docker_overlay_network`
- **source:** https://itlead.org/interview-questions/docker/docker-overlay-network
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-overlay-network.bank.json` → `pnpm seed:topic -- docker_overlay_network`
- **status:** draft

## Вопрос

> Что такое Docker overlay network и когда она нужна?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | overlay_definition | Определение overlay и multi-host | 2.0 | core_plus | ядро — виртуальная L2-сеть поверх IP underlay |
| 1 | vxlan_encapsulation | VXLAN-инкапсуляция и underlay | 1.5 | intermediate | UDP 4789, отдельное IP-пространство overlay |
| 2 | swarm_requirement | Swarm и создание overlay | 1.0 | basic | docker swarm init, --driver overlay |
| 3 | service_discovery_lb | DNS и балансировка в Swarm | 1.5 | core_plus | embedded DNS, VIP, IPVS |
| 4 | when_to_use | Когда нужна и когда нет | 1.5 | intermediate | multi-host vs bridge/K8s/NAT |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | без Swarm, attachable, firewall, single host |
| 6 | encrypted_overlay | Шифрованный overlay | 0.5 | mention | --opt encrypted, AES-GCM/IPsec |

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
