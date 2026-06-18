# Диагностика Docker networking

- **topic_code:** `troubleshoot_docker_networking`
- **source:** https://itlead.org/interview-questions/docker/troubleshoot-docker-networking
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/troubleshoot-docker-networking.bank.json` → `pnpm seed:topic -- troubleshoot_docker_networking`
- **status:** draft

## Вопрос

> Как диагностировать сетевые проблемы между Docker контейнерами?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | diagnostic_order | Знает порядок диагностики layer-by-layer | 2 | core_plus | Diagnostic checklist |
| 1 | same_network_dns | Проверяет same network и DNS | 1.5 | core_plus | Same network and DNS |
| 2 | default_bridge_limit | Знает ограничения default bridge | 1 | intermediate | Default bridge no DNS |
| 3 | port_reachability | Диагностирует port-level | 1.5 | intermediate | Port reachability |
| 4 | bind_localhost | Знает ошибку bind 127.0.0.1 | 1.5 | intermediate | Bind localhost mistake |
| 5 | firewall_iptables | Диагностирует firewall и iptables | 1 | advanced | Firewall iptables |
| 6 | overlay_mtu | Знает overlay MTU и host network | 0.5 | advanced | Overlay MTU host network |
| 7 | netshoot_tools | Знает netshoot и tcpdump | 0.5 | mention | Diagnostic tools |
| 8 | common_mistakes | Знает типичные ошибки networking | 0.5 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
