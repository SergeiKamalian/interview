# Live migration Docker-контейнера через CRIU

- **topic_code:** `docker_live_migration_criu`
- **source:** https://itlead.org/interview-questions/docker/docker-live-migration-criu
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-live-migration-criu.bank.json` → `pnpm seed:topic -- docker_live_migration_criu`
- **status:** draft

## Вопрос

> Как выполнить live migration Docker-контейнера между хостами с помощью CRIU?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | criu_definition | Понимает CRIU и механизм checkpoint/restore | 1.5 | core_plus | ядро TL;DR — freeze process tree, memory/FD/namespaces на диск |
| 1 | docker_checkpoint_integration | Знает docker checkpoint и experimental | 1.0 | basic | daemon.json experimental, create/start --checkpoint |
| 2 | same_host_checkpoint | Умеет snapshot/restore на одном хосте | 1.0 | basic | counter busybox, cp1, resume с 48 не с 0 |
| 3 | cross_host_migration | Описывает cross-host migration flow | 2.0 | intermediate | image на обоих, checkpoint, rsync, create, start --checkpoint |
| 4 | host_state_requirements | Понимает требования к идентичности хостов | 1.5 | core_plus | kernel, CPU, Docker version, volumes, network IP/MAC |
| 5 | use_cases_vs_alternatives | Различает когда CRIU vs stateless redeploy | 1.5 | core_plus | HPC/ML vs web/microservices; blue-green, drain, app-level checkpoint |
| 6 | common_mistakes | Знает типичные ошибки migration | 1.0 | intermediate | production myth, TCP, kernel mismatch, state across hosts |
| 7 | limitations_experimental | Знает ограничения и статус experimental | 0.5 | mention | no GPU, no Docker Desktop, KEP-2008 alpha |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
