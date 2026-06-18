# Список Docker-контейнеров (docker ps)

- **topic_code:** `list_docker_containers`
- **source:** https://itlead.org/interview-questions/docker/list-docker-containers
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/list-docker-containers.bank.json` → `pnpm seed:topic -- list_docker_containers`
- **status:** draft

## Вопрос

> Как показать список запущенных и всех Docker-контейнеров?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ps_running_vs_all | docker ps vs docker ps -a | 1.5 | core_plus | TL;DR: running only vs все состояния daemon |
| 1 | quiet_mode_scripting | Quiet mode и пайпы | 1.0 | basic | -q, -l, -n, -alq для скриптов и docker rm/logs |
| 2 | filter_flags | Фильтры --filter | 2.0 | intermediate | status/name/label/ancestor, AND-комбинации |
| 3 | format_output | --format и --no-trunc | 1.5 | core_plus | кастомные колонки, JSON для jq, полные строки |
| 4 | common_mistakes | Типичные ошибки | 2.5 | advanced | пропуск -a, grep вместо filter, rm без -q |
| 5 | related_commands | Связанные команды | 1.5 | core_plus | container ls, stats vs ps, compose ps/filter, prune |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| common_mistakes | ps_running_vs_all | 0.40 |
| filter_flags | ps_running_vs_all | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
