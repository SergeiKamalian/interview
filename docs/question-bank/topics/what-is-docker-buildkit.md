# Docker BuildKit

- **topic_code:** `what_is_docker_buildkit`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-buildkit
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-buildkit.bank.json` → `pnpm seed:topic -- what_is_docker_buildkit`
- **status:** draft

## Вопрос

> Что такое BuildKit и какие преимущества он даёт?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | buildkit_definition | Определяет BuildKit | 1.5 | core_plus | TL;DR buildkit |
| 1 | parallel_stages | Параллельные stages | 1.5 | core_plus | killer feature 1 |
| 2 | cache_mounts | Cache mounts | 2 | intermediate | killer feature 2 |
| 3 | secret_mounts | Secret mounts | 2 | intermediate | killer feature 3 security |
| 4 | legacy_vs_buildkit | Legacy vs BuildKit | 1.5 | core_plus | architecture comparison |
| 5 | enable_buildx | Включение и buildx | 1.5 | core_plus | enabling section |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
