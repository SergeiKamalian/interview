# Restart policy в Docker

- **topic_code:** `docker_restart_policy`
- **source:** https://itlead.org/interview-questions/docker/docker-restart-policy
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-restart-policy.bank.json` → `pnpm seed:topic -- docker_restart_policy`
- **status:** draft

## Вопрос

> Что такое restart policy в Docker и какие варианты существуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | restart_policy_basics | Понимает restart policy | 1.5 | core_plus | определение, --restart, четыре значения |
| 1 | policy_no_and_on_failure | Знает no и on-failure | 1.5 | core_plus | дефолт no, on-failure[:N], batch jobs |
| 2 | always_vs_unless_stopped | Различает always и unless-stopped | 2.0 | intermediate | prod default, ручной docker stop |
| 3 | daemon_reboot_backoff | Поведение daemon и backoff | 1.5 | core_plus | reboot, retry, exponential backoff |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | забыть policy, healthcheck vs exit |
| 5 | compose_and_usage | Compose и практика | 1.5 | basic | YAML кавычки, inspect, real-world |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| always_vs_unless_stopped | restart_policy_basics | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
