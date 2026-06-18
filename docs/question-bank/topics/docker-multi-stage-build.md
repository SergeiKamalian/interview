# Multi-stage Docker build

- **topic_code:** `docker_multi_stage_build`
- **source:** https://itlead.org/interview-questions/docker/docker-multi-stage-build
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-multi-stage-build.bank.json` → `pnpm seed:topic -- docker_multi_stage_build`
- **status:** draft

## Вопрос

> Что такое multi-stage Docker build и зачем он нужен?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | multi_stage_definition | Суть multi-stage build | 1.5 | core_plus | несколько FROM, AS, COPY --from, build heavy / ship light |
| 1 | size_security_benefits | Размер и безопасность | 1.5 | intermediate | 600 MB → 25 MB, attack surface, CVE |
| 2 | copy_from_stages | COPY --from и ссылки на стейджи | 2.0 | intermediate | context vs stage filesystem, внешние образы |
| 3 | build_target_flag | --target и финальный stage | 1.0 | basic | последний FROM, CI test/dev образы |
| 4 | common_patterns | Типичные паттерны | 1.0 | basic | Go/scratch, SPA+nginx, distroless, build→test→runtime |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | COPY без --from, runtime bloat, dev deps, latest |
| 6 | buildkit_ci | BuildKit и CI-практики | 1.0 | basic | параллельность, --target test, trivy scan stage |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| copy_from_stages | multi_stage_definition | 0.45 |
| common_mistakes | copy_from_stages | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
