# Docker в CI/CD pipeline

- **topic_code:** `docker_ci_cd_pipeline`
- **source:** https://itlead.org/interview-questions/docker/docker-in-ci-cd-pipeline
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-in-ci-cd-pipeline.bank.json` → `pnpm seed:topic -- docker_ci_cd_pipeline`
- **status:** draft

## Вопрос

> Как практически использовать Docker в CI/CD pipeline?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | pipeline_shape | Стандартная форма pipeline | 1.5 | core_plus | TL;DR — checkout → build → test → scan → push → deploy |
| 1 | build_once_promote | Build once, promote everywhere | 1.5 | core_plus | критический принцип — не rebuild для prod |
| 2 | cache_strategy | Стратегии кэширования | 1.5 | intermediate | GHA / registry / S3 backends |
| 3 | tagging_strategy | Тегирование и pinning | 1.0 | basic | SHA, semver, digest; не latest в prod |
| 4 | multistage_testing | Тесты внутри образа | 1.5 | intermediate | multi-stage --target test |
| 5 | vuln_scanning_signing | Scan и подпись | 1.0 | basic | Trivy + Cosign по digest |
| 6 | common_mistakes | Типичные ошибки | 2.0 | intermediate | rebuild per env, ARG secrets, host tests |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| build_once_promote | pipeline_shape | 0.40 |
| common_mistakes | build_once_promote | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
