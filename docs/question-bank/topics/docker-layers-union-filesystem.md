# Docker layers и Union File System

- **topic_code:** `docker_layers_union_filesystem`
- **source:** https://itlead.org/interview-questions/docker/docker-layers-union-filesystem
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-layers-union-filesystem.bank.json` → `pnpm seed:topic -- docker_layers_union_filesystem`
- **status:** draft

## Вопрос

> Объясните, что такое Docker layers (слои) и Union File System, и как они влияют на размер образа и кэш сборки?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | layers_definition | Понимает Docker layers | 1.5 | core_plus | ядро — read-only diff, инструкция Dockerfile, SHA256, dedup |
| 1 | union_filesystem_overlayfs | Знает Union FS / OverlayFS | 1.5 | core_plus | lowerdir/upperdir/merged, стек read-only + writable |
| 2 | copy_on_write | Понимает copy-on-write | 1.5 | intermediate | copy-up, writable layer, volumes для persistence |
| 3 | build_cache_layers | Знает build cache и порядок Dockerfile | 2.0 | intermediate | cache key, miss инвалидирует ниже, package.json до source |
| 4 | image_size_whiteouts | Понимает размер образа и whiteouts | 2.0 | intermediate | `.wh.`, удаление в другом RUN не уменьшает образ |
| 5 | common_mistakes | Знает типичные ошибки | 1.0 | basic | add/delete в разных слоях, npm на каждый commit, CoW на БД |
| 6 | real_world_practices | Знает multi-stage и BuildKit | 0.5 | mention | multi-stage, distroless, cache mounts, registry dedup |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| union_filesystem_overlayfs | layers_definition | 0.45 |
| image_size_whiteouts | common_mistakes | 0.40 |
| build_cache_layers | layers_definition | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
