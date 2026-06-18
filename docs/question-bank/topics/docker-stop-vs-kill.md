# docker stop vs docker kill

- **topic_code:** `docker_stop_vs_kill`
- **source:** https://itlead.org/interview-questions/docker/docker-stop-vs-kill
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-stop-vs-kill.bank.json` → `pnpm seed:topic -- docker_stop_vs_kill`
- **status:** draft

## Вопрос

> В чём разница между `docker stop` и `docker kill`?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | stop_vs_kill_core | Главное отличие stop и kill | 2.0 | core_plus | TL;DR ITLead — graceful vs immediate |
| 1 | docker_stop_flow | Механизм docker stop | 1.5 | core_plus | SIGTERM → grace → SIGKILL |
| 2 | docker_kill_mechanism | Механизм docker kill | 1.5 | basic | SIGKILL по умолчанию, --signal |
| 3 | when_to_use | Когда stop, когда kill | 2.0 | core_plus | БД/сервисы vs hung / control signals |
| 4 | grace_period_config | Настройка grace period | 1.0 | basic | -t, --stop-timeout, Compose |
| 5 | common_mistakes | Типичные ошибки | 1.5 | basic | kill БД, kill --signal=SIGTERM, PID 1 |
| 6 | exit_codes | Коды выхода 137 и 143 | 0.5 | mention | диагностика по exit code |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
