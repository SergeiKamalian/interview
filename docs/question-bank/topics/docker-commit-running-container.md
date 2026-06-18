# Создание Docker-образа из контейнера (docker commit)

- **topic_code:** `docker_commit_running_container`
- **source:** https://itlead.org/interview-questions/docker/docker-commit-running-container
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-commit-running-container.bank.json` → `pnpm seed:topic -- docker_commit_running_container`
- **status:** draft

## Вопрос

> Как создать Docker-образ из запущенного (или остановленного) контейнера?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | commit_definition | Понимает docker commit | 1.5 | core_plus | snapshot writable-слоя + базовых слоёв → новый image |
| 1 | commit_syntax_flags | Знает синтаксис и флаги | 1.0 | basic | `-m`, `-a`, `-p`/`--pause=false`, repository:tag |
| 2 | production_antipattern | Понимает антипаттерн для prod | 2.0 | intermediate | нет Dockerfile, reproducibility, review, bloat, drift |
| 3 | legitimate_uses | Знает допустимые сценарии | 1.5 | intermediate | debug snapshot, exploration→Dockerfile, disaster recovery |
| 4 | common_mistakes | Знает типичные ошибки | 2.0 | intermediate | deploy через commit, pause, secrets в env, commit-цепочки |
| 5 | commit_c_flag | Знает флаг `-c` | 1.0 | basic | CMD, ENV, LABEL и др. Dockerfile-инструкции при commit |
| 6 | commit_vs_related | Отличает commit от save/diff | 1.0 | basic | commit vs save, docker diff, stopped container, наследование config |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| production_antipattern | commit_definition | 0.45 |
| common_mistakes | production_antipattern | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
| | | | | | | |
