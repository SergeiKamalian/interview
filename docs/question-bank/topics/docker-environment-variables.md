# Переменные окружения в Docker

- **topic_code:** `docker_environment_variables`
- **source:** https://itlead.org/interview-questions/docker/docker-environment-variables
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-environment-variables.bank.json` → `pnpm seed:topic -- docker_environment_variables`
- **status:** draft

## Вопрос

> Как использовать переменные окружения в Docker?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | env_four_ways | Четыре способа задать env | 2.0 | core_plus | TL;DR ITLead — ENV, -e, --env-file, Compose |
| 1 | env_in_dockerfile | ENV в Dockerfile | 1.5 | core_plus | запечено в image, override через -e, history/inspect |
| 2 | docker_run_env | -e и --env-file на docker run | 1.0 | basic | per-container runtime, pass-through из shell |
| 3 | compose_env | Compose environment и env_file | 1.5 | intermediate | interpolation ${VAR}, приоритет источников |
| 4 | arg_vs_env | ARG vs ENV | 1.5 | intermediate | build-time vs runtime, паттерн ARG→ENV |
| 5 | secrets_not_in_env | Секреты не в env | 2.0 | intermediate | inspect/ps/environ, BuildKit, Swarm/K8s secrets |
| 6 | common_mistakes | Типичные ошибки | 0.5 | mention | кавычки в .env, .env Compose vs env_file |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
