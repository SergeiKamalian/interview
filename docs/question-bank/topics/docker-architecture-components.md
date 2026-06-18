# Компоненты архитектуры Docker

- **topic_code:** `docker_architecture_components`
- **source:** https://itlead.org/interview-questions/docker/docker-architecture-components
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-architecture-components.bank.json` → `pnpm seed:topic -- docker_architecture_components`
- **status:** draft

## Вопрос

> Какие основные компоненты входят в архитектуру Docker и как они взаимодействуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | architecture_stack | Понимает стек Docker | 1.5 | core_plus | client → dockerd → containerd → runc → процесс + registry — ядро TL;DR |
| 1 | docker_client | Знает роль Docker CLI | 1.0 | basic | тонкий REST-клиент, docker.sock, без собственного состояния |
| 2 | dockerd_daemon | Знает роль dockerd | 1.5 | core_plus | Engine API, images/networks/volumes/build; делегирует lifecycle containerd |
| 3 | containerd_runc_shim | Различает containerd, runc и shim | 2.0 | intermediate | lifecycle vs OCI one-shot; shim держит контейнер живым |
| 4 | registry_role | Понимает registry | 1.0 | basic | хранение и дистрибуция образов, Docker Hub, ECR, OCI Distribution |
| 5 | docker_run_flow | Описывает flow docker run | 1.5 | core_plus | hello-world / nginx через все слои от CLI до exec процесса |
| 6 | common_mistakes | Знает типичные заблуждения | 1.5 | intermediate | dockerd ≠ containerd; CLI не работает без daemon; Mac/Windows VM |

**Σ weight = 10.00**

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
