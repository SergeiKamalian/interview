# Управление секретами в Docker

- **topic_code:** `manage_docker_secrets`
- **source:** https://itlead.org/interview-questions/docker/manage-docker-secrets
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/manage-docker-secrets.bank.json` → `pnpm seed:topic -- manage_docker_secrets`
- **status:** draft

## Вопрос

> Как правильно управлять секретами (паролями, ключами) в Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | secrets_three_layers | Понимает три слоя управления секретами | 2 | core_plus | ядро TL;DR — три проблемы, три ответа |
| 1 | why_env_wrong | Объясняет почему ENV не подходит для секретов | 1.5 | core_plus | Why ENV is wrong ITLead |
| 2 | buildkit_secrets | Знает BuildKit secret mounts для build-time | 1.5 | intermediate | Build-time secrets via BuildKit |
| 3 | runtime_swarm_secrets | Знает runtime-секреты через Swarm и файлы | 1.5 | intermediate | Runtime secrets via Swarm |
| 4 | file_pattern_compose | Знает _FILE-паттерн и Compose secrets | 1 | basic | Compose + _FILE pattern |
| 5 | external_managers | Знает внешние secret managers и sidecar | 1.5 | advanced | Production external managers |
| 6 | common_mistakes | Знает типичные ошибки | 0.5 | basic | Common mistakes ITLead |
| 7 | ci_secrets | Понимает секреты в CI | 0.5 | mention | CI secrets handling |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
