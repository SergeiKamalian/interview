# Docker Registry vs Docker Hub

- **topic_code:** `docker_registry_vs_docker_hub`
- **source:** https://itlead.org/interview-questions/docker/docker-registry-vs-docker-hub
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-registry-vs-docker-hub.bank.json` → `pnpm seed:topic -- docker_registry_vs_docker_hub`
- **status:** draft

## Вопрос

> В чём разница между Docker registry и Docker Hub?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | registry_vs_hub | Отличает registry от Docker Hub | 2.0 | core_plus | ядро — тип vs конкретный экземпляр docker.io |
| 1 | oci_distribution_spec | Понимает OCI Distribution Spec | 1.5 | core_plus | общий протокол push/pull для всех registry |
| 2 | image_name_prefix | Знает префикс registry в имени образа | 1.0 | basic | без префикса — implicit docker.io |
| 3 | docker_hub_specifics | Знает особенности Docker Hub | 1.5 | intermediate | Official Images, rate limit, free tier |
| 4 | production_registry_choice | Выбирает registry для production | 1.5 | intermediate | ECR/GCR/GHCR/Harbor по контексту |
| 5 | common_mistakes | Знает типичные ошибки | 1.5 | intermediate | Hub как «the registry», push без префикса, rate limit, mirror auth |
| 6 | pull_through_cache | Понимает pull-through cache / mirror | 1.0 | basic | CI rate limit fix, кеш между Hub и кластером |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| production_registry_choice | registry_vs_hub | 0.45 |
| common_mistakes | image_name_prefix | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| — | — | — | — | — | — | не запускался |
