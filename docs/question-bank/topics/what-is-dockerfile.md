# Что такое Dockerfile

- **topic_code:** `what_is_dockerfile`
- **source:** https://itlead.org/interview-questions/docker/what-is-dockerfile
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-dockerfile.bank.json` → `pnpm seed:topic -- what_is_dockerfile`
- **status:** draft

## Вопрос

> Что такое Dockerfile и как он используется?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | dockerfile_definition | Что такое Dockerfile | 2.0 | core_plus | TL;DR — рецепт, слои, docker build |
| 1 | key_instructions | Ключевые инструкции | 2.0 | basic | FROM, COPY, RUN, CMD, ENTRYPOINT, ARG |
| 2 | build_cache_order | Кэш и порядок инструкций | 2.0 | intermediate | deps до source, cache invalidation |
| 3 | cmd_vs_entrypoint | CMD vs ENTRYPOINT | 1.5 | intermediate | build-time RUN vs runtime CMD |
| 4 | multi_stage_builds | Multi-stage builds | 1.5 | intermediate | build stage → slim runtime |
| 5 | common_mistakes | Типичные ошибки | 1.0 | mention | root, dockerignore, RUN layers |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
