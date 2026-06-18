# Что такое Docker Swarm

- **topic_code:** `what_is_docker_swarm`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-swarm
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-swarm.bank.json` → `pnpm seed:topic -- what_is_docker_swarm`
- **status:** draft

## Вопрос

> Что такое Docker Swarm и как он работает?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | swarm_definition | Что такое Swarm | 2.0 | core_plus | встроенный оркестратор, кластер |
| 1 | architecture_nodes | Manager/worker | 1.5 | intermediate | raft quorum, 3 managers |
| 2 | services_tasks | Service vs Task | 2.0 | core_plus | desired state, reconcile |
| 3 | routing_mesh | Routing mesh | 1.5 | intermediate | overlay DNS, ingress |
| 4 | stacks_updates | Stack и updates | 1.5 | intermediate | stack deploy, rolling update |
| 5 | swarm_vs_k8s | Swarm vs K8s | 1.0 | basic | 2026 comparison |
| 6 | common_mistakes | Типичные ошибки | 0.5 | mention | один manager, bind mount |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
