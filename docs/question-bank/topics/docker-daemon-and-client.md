# Docker daemon и Docker client

- **topic_code:** `docker_daemon_client`
- **source:** https://itlead.org/interview-questions/docker/docker-daemon-and-client
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-daemon-and-client.bank.json` → `pnpm seed:topic -- docker_daemon_client`
- **status:** draft

## Вопрос

> Как взаимодействуют Docker daemon и Docker client?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | client_server_split | Понимает client-server модель | 1.5 | core_plus | daemon владеет state, CLI — stateless REST frontend — ядро TL;DR |
| 1 | daemon_responsibilities | Знает зоны ответственности dockerd | 1.5 | core_plus | images, lifecycle API, networks, volumes, daemon.json |
| 2 | client_cli_flow | Знает flow Docker CLI | 1.0 | basic | parse → context → HTTP JSON → format; curl эквивалент docker ps |
| 3 | transport_sockets | Понимает транспорт Unix vs TCP | 2.0 | intermediate | docker.sock, permissions, DOCKER_HOST, TLS обязателен для TCP |
| 4 | docker_contexts | Знает Docker contexts | 1.0 | basic | один CLI — несколько daemon, SSH remote без DOCKER_HOST |
| 5 | api_versioning | Понимает версионирование Engine API | 1.0 | basic | /v1.46/, mismatch, DOCKER_API_VERSION |
| 6 | security_pitfalls | Знает security-ловушки и отладку | 2.0 | intermediate | docker group=root, TCP 2375, socket mount, live-restore, CLI hang |

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
