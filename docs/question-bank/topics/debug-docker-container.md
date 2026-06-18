# Отладка Docker-контейнера

- **topic_code:** `debug_docker_container`
- **source:** https://itlead.org/interview-questions/docker/debug-docker-container
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/debug-docker-container.bank.json` → `pnpm seed:topic -- debug_docker_container`
- **status:** draft

## Вопрос

> Как отлаживать проблемы в Docker-контейнере?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | debug_flowchart | Порядок отладки (flowchart) | 1.5 | core_plus | TL;DR ITLead — ps → logs → inspect → exec → entrypoint |
| 1 | docker_logs | Логи контейнера | 1.5 | core_plus | stdout/stderr PID 1, флаги logs, 12-factor |
| 2 | docker_inspect | inspect и диагностика состояния | 2.0 | intermediate | exit code, OOM, mounts, network, health |
| 3 | exec_entrypoint | exec и override entrypoint | 2.0 | intermediate | live debug, crash-fast, distroless :debug |
| 4 | exit_codes | Exit codes и сигналы | 1.0 | basic | 125/126/127/137/139/143 из follow-up ITLead |
| 5 | common_mistakes | Типичные ошибки отладки | 2.0 | intermediate | file logs, -it, docker stop, port proxy |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| docker_inspect | debug_flowchart | 0.45 |
| exec_entrypoint | docker_logs | 0.40 |
| common_mistakes | docker_logs | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
