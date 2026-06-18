# Настройка Harbor private registry

- **topic_code:** `setup_harbor_private_registry`
- **source:** https://itlead.org/interview-questions/docker/setup-harbor-private-registry
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/setup-harbor-private-registry.bank.json` → `pnpm seed:topic -- setup_harbor_private_registry`
- **status:** draft

## Вопрос

> Как настроить приватный Docker registry (Harbor)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | harbor_overview | Определяет Harbor и отличие от registry:2 | 2 | core_plus | Harbor vs registry:2 |
| 1 | install_compose | Знает установку через Compose | 1.5 | core_plus | Single-node Compose install |
| 2 | push_pull_workflow | Знает push/pull workflow | 1.5 | intermediate | Push pull workflow |
| 3 | projects_rbac | Понимает projects и RBAC | 1.5 | intermediate | Projects and RBAC |
| 4 | scanning_replication | Знает scanning и replication | 1.5 | intermediate | Scanning and replication |
| 5 | retention_ha | Знает retention и HA | 0.5 | basic | Retention and HA |
| 6 | common_mistakes | Знает типичные ошибки | 1 | basic | Common mistakes |
| 7 | multi_region | Понимает multi-region архитектуру | 0.5 | mention | Senior multi-region |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
