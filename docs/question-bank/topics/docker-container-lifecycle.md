# Жизненный цикл Docker-контейнера

- **topic_code:** `docker_container_lifecycle`
- **source:** https://itlead.org/interview-questions/docker/docker-container-lifecycle
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-container-lifecycle.bank.json` → `pnpm seed:topic -- docker_container_lifecycle`
- **status:** draft

## Вопрос

> Что такое жизненный цикл Docker-контейнера и через какие состояния он проходит?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | lifecycle_states | Состояния контейнера | 1.5 | core_plus | created/running/paused/restarting/exited/dead + removed |
| 1 | create_run_start | create, start, run | 1.0 | basic | docker run = create + start |
| 2 | docker_stop_mechanism | Механизм docker stop | 2.0 | intermediate | SIGTERM → grace 10 с → SIGKILL; stop vs kill |
| 3 | exited_vs_removed | exited vs removed | 2.0 | intermediate | stop не удаляет; docker start оживляет; rm удаляет |
| 4 | exit_codes_debugging | Exit codes и отладка | 2.0 | intermediate | 0/137/143/1, OOMKilled, docker inspect |
| 5 | restart_policies | Restart policies | 1.5 | core_plus | no/on-failure/always/unless-stopped, crash loop |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| exited_vs_removed | lifecycle_states | 0.40 |
| exit_codes_debugging | docker_stop_mechanism | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
