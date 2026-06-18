# Linux namespaces и cgroups в Docker

- **topic_code:** `docker_namespaces_cgroups`
- **source:** https://itlead.org/interview-questions/docker/docker-namespaces-cgroups
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-namespaces-cgroups.bank.json` → `pnpm seed:topic -- docker_namespaces_cgroups`
- **status:** draft

## Вопрос

> Что такое Linux namespaces и cgroups в Docker и как они делают контейнеры возможными?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | namespaces_vs_cgroups | Различает namespaces и cgroups | 1.5 | core_plus | TL;DR: visibility vs resource control — ядро темы |
| 1 | seven_namespace_types | Знает семь типов namespaces | 1.5 | core_plus | PID, mnt, net, IPC, UTS, user, cgroup — таблица ITLead |
| 2 | cgroups_limits | Понимает лимиты cgroups | 1.5 | core_plus | memory, CPU, I/O, pids; флаги --memory, --cpus |
| 3 | docker_run_mechanism | Описывает механизм docker run | 2.0 | intermediate | unshare → cgroup files → pivot_root → exec через runc |
| 4 | namespace_verification | Умеет проверять изоляцию | 1.0 | basic | /proc/self/ns, lsns, демо PID namespace |
| 5 | common_mistakes | Знает типичные заблуждения | 1.5 | intermediate | namespaces ≠ security; OOM 137; --user vs userns-remap |
| 6 | cgroups_v1_linux | Знает cgroups v1/v2 и Linux-only | 1.0 | basic | unified hierarchy; Mac/Windows — Linux VM; unshare |

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
