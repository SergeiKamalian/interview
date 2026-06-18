# Inspect container state, logs, metadata

- **topic_code:** `inspect_container_state_logs`
- **source:** https://itlead.org/interview-questions/docker/inspect-container-state-logs
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/inspect-container-state-logs.bank.json` → `pnpm seed:topic -- inspect_container_state_logs`
- **status:** draft

## Вопрос

> Как проверить состояние контейнера, его логи и метаданные?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | observability_overview | Три команды observability | 2.0 | core_plus | TL;DR: ps — состояние, logs — stdout, inspect — метаданные |
| 1 | docker_ps_state | docker ps — быстрый статус | 1.5 | basic | running/exited, порты, образ, фильтры |
| 2 | docker_logs | docker logs — stdout/stderr | 2.0 | intermediate | PID 1, -f/--tail/--since, compose logs |
| 3 | docker_inspect_format | docker inspect и --format | 2.0 | intermediate | JSON метаданные, ExitCode, OOMKilled, IP, mounts |
| 4 | stats_top_port | stats, top, port | 1.0 | basic | ресурсы, процессы, маппинг портов |
| 5 | common_mistakes | Типичные ошибки | 1.5 | core_plus | file logs, --no-stream, grep вместо --format, без --tail |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
