# Как зайти внутрь running Docker-контейнера

- **topic_code:** `exec_inside_running_container`
- **source:** https://itlead.org/interview-questions/docker/exec-inside-running-container
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/exec-inside-running-container.bank.json` → `pnpm seed:topic -- exec_inside_running_container`
- **status:** draft

## Вопрос

> Как зайти внутрь уже запущенного Docker-контейнера?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | exec_command_core | docker exec — новый процесс в running-контейнере | 2.0 | core_plus | TL;DR: exec -it, не PID 1, namespaces контейнера |
| 1 | it_flags | Флаги -i и -t для интерактивного shell | 1.5 | basic | без -it shell сразу выходит |
| 2 | shell_selection | Выбор shell по образу (sh/bash/distroless) | 2.0 | intermediate | Alpine sh, Ubuntu bash, scratch без shell |
| 3 | exec_prerequisites | exec только для running; run -it при старте | 1.0 | basic | stopped container, docker run vs exec |
| 4 | common_mistakes | Типичные ошибки (-it, bash, exec vs attach) | 2.0 | intermediate | Common mistakes блок ITLead |
| 5 | flags_and_usage | Полезные флаги и сценарии использования | 1.5 | basic | -u -w -e -d, compose exec, one-off |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
