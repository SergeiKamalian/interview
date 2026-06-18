# Сигналы и init-процесс в контейнерах

- **topic_code:** `container_signals_init_process`
- **source:** https://itlead.org/interview-questions/docker/container-signals-init-process
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/container-signals-init-process.bank.json` → `pnpm seed:topic -- container_signals_init_process`
- **status:** draft

## Вопрос

> Как обрабатывать сигналы в контейнерах и что такое init-процесс?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | pid1_special_role | Роль PID 1 в контейнере | 1.5 | core_plus | ядро — особая семантика Unix init |
| 1 | sigterm_graceful_shutdown | docker stop и SIGTERM | 1.5 | core_plus | graceful shutdown — главная production-проблема |
| 2 | zombies_init_process | Зомби и init-процесс | 1.0 | intermediate | fork/multiprocessing в long-running контейнерах |
| 3 | tini_init_flag | tini и --init | 1.5 | core_plus | стандартное решение zombie + signal forward |
| 4 | shell_vs_exec_form | Shell form vs exec form CMD | 2.0 | intermediate | самая частая причина сломанного docker stop |
| 5 | entrypoint_exec | exec в entrypoint-скриптах | 1.0 | basic | практический паттерн docker-entrypoint.sh |
| 6 | common_mistakes | Типичные ошибки | 1.0 | intermediate | exit 137, fake trap, real-world impact |
| 7 | signals_debug | Отладка сигналов | 0.5 | mention | STOPSIGNAL, SIGINT vs SIGTERM, strace |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| sigterm_graceful_shutdown | pid1_special_role | 0.45 |
| tini_init_flag | zombies_init_process | 0.40 |
| shell_vs_exec_form | sigterm_graceful_shutdown | 0.40 |
| shell_vs_exec_form | entrypoint_exec | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
