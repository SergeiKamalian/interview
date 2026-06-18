# docker exec vs docker attach

- **topic_code:** `docker_exec_vs_attach`
- **source:** https://itlead.org/interview-questions/docker/docker-exec-vs-attach
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-exec-vs-attach.bank.json` → `pnpm seed:topic -- docker_exec_vs_attach`
- **status:** draft

## Вопрос

> В чём разница между `docker exec` и `docker attach`?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | exec_vs_attach_core | Ключевое различие exec и attach | 2.0 | core_plus | TL;DR: новый процесс vs stdio PID 1 |
| 1 | exec_new_process | Как работает docker exec | 1.0 | basic | отдельный процесс, exit не останавливает контейнер |
| 2 | attach_pid1_stdio | Как работает docker attach | 1.5 | basic | подключение к stdin/stdout/stderr PID 1 |
| 3 | ctrl_c_sigint_risk | Риск Ctrl+C при attach | 2.0 | intermediate | SIGINT на PID 1 → остановка контейнера |
| 4 | detach_ctrl_p_q | Безопасный detach | 1.0 | basic | Ctrl+P, Ctrl+Q, нужен -it |
| 5 | practical_usage | Когда exec, когда attach | 1.5 | basic | debug vs REPL/console; docker logs -f |
| 6 | common_mistakes | Типичные ошибки | 1.0 | basic | attach вместо exec, без -it, stopped container |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
