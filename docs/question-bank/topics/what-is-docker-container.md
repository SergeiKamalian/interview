# Что такое Docker-контейнер

- **topic_code:** `what_is_docker_container`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-container
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-container.bank.json` → `pnpm seed:topic -- what_is_docker_container`
- **status:** draft

## Вопрос

> Что такое Docker-контейнер?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | container_definition | Определяет контейнер | 1.5 | core_plus | ядро TL;DR |
| 1 | isolation_namespaces | Namespaces и cgroups | 1.5 | core_plus | механизм изоляции |
| 2 | lifecycle_states | Жизненный цикл | 1 | basic | states из ITLead diagram |
| 3 | ephemeral_writable_layer | Эфемерность writable layer | 2 | intermediate | replaceable container |
| 4 | volumes_for_state | Volumes для данных | 1.5 | core_plus | data persistence |
| 5 | common_mistakes | Типичные ошибки | 1.5 | core_plus | common mistakes ITLead |
| 6 | key_commands | Ключевые команды | 1 | basic | key commands ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
