# Что такое Docker-образ

- **topic_code:** `what_is_docker_image`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-image
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-image.bank.json` → `pnpm seed:topic -- what_is_docker_image`
- **status:** draft

## Вопрос

> Что такое Docker-образ (image)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | image_definition | Определяет образ | 1.5 | core_plus | ядро TL;DR |
| 1 | layers_manifest_config | Слои, manifest, config | 1.5 | core_plus | три части образа из ITLead |
| 2 | tag_vs_digest | Tag vs digest | 2 | intermediate | reproducible deploys |
| 3 | build_vs_pull | Build vs pull | 1 | basic | два пути получить image |
| 4 | image_vs_container | Образ vs контейнер | 2 | basic | частая путаница |
| 5 | common_mistakes | Типичные ошибки с образами | 2 | intermediate | latest + build context + immutability |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
