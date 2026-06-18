# Docker Build Cache

- **topic_code:** `docker_build_cache`
- **source:** https://itlead.org/interview-questions/docker/docker-build-cache
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-build-cache.bank.json` → `pnpm seed:topic -- docker_build_cache`
- **status:** draft

## Вопрос

> Как работает Docker build cache и как им управлять?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cache_key_mechanism | Как вычисляется cache key | 2.0 | intermediate | ядро темы — digest цепочки, COPY vs RUN |
| 1 | cache_invalidation_chain | Цепочка инвалидации | 1.5 | core_plus | miss на шаге → всё ниже пересобирается |
| 2 | instruction_order | Порядок инструкций | 2.0 | intermediate | deps first, source last — главный практический skill |
| 3 | buildkit_cache_mounts | BuildKit cache mounts | 1.5 | core_plus | mount вне слоя, pip/npm/apt targets |
| 4 | ci_cache_sharing | Кэш в CI через registry/GHA | 1.0 | basic | buildx cache-from/cache-to, эфемерные runner |
| 5 | common_mistakes | Типичные ошибки | 1.5 | core_plus | COPY до install, apt в двух RUN, RUN не смотрит внутрь |
| 6 | cache_bypass_management | Обход и управление кэшем | 0.5 | mention | --no-cache, --pull, builder prune, buildx du |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| instruction_order | cache_key_mechanism | 0.45 |
| common_mistakes | instruction_order | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
