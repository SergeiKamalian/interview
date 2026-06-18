# Multi-platform Docker builds (ARM + AMD64)

- **topic_code:** `docker_multi_platform_builds`
- **source:** https://itlead.org/interview-questions/docker/docker-multi-platform-builds
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-multi-platform-builds.bank.json` → `pnpm seed:topic -- docker_multi_platform_builds`
- **status:** draft

## Вопрос

> Как собирать multi-platform Docker-образы (ARM + AMD64)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | multi_platform_why | Зачем нужны multi-platform образы | 1.5 | core_plus | Apple Silicon, Graviton, edge — один tag для разных CPU |
| 1 | manifest_list | Понимает manifest list | 1.5 | core_plus | fat manifest, pull-time выбор архитектуры daemon |
| 2 | buildx_workflow | Знает workflow buildx | 2.0 | intermediate | create builder, --platform, --push, imagetools inspect |
| 3 | qemu_vs_native | QEMU vs native builders | 1.5 | core_plus | binfmt/QEMU медленно; native ARM node для production |
| 4 | push_vs_load | Ограничения --push и --load | 1.0 | basic | multi-arch не в local store; dev — --platform local --load |
| 5 | common_pitfalls | Типичные ошибки сборки | 1.5 | core_plus | native deps под QEMU, Go CGO, TARGETARCH |
| 6 | ci_real_world | CI и практическое применение | 1.0 | basic | GitHub Actions, cache-from gha, amd64+arm64 минимум |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| buildx_workflow | manifest_list | 0.45 |
| common_pitfalls | qemu_vs_native | 0.40 |

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
