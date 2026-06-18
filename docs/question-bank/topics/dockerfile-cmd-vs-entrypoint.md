# CMD vs ENTRYPOINT в Dockerfile

- **topic_code:** `dockerfile_cmd_vs_entrypoint`
- **source:** https://itlead.org/interview-questions/docker/dockerfile-cmd-vs-entrypoint
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/dockerfile-cmd-vs-entrypoint.bank.json` → `pnpm seed:topic -- dockerfile_cmd_vs_entrypoint`
- **status:** draft

## Вопрос

> В чём разница между CMD и ENTRYPOINT в Dockerfile?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cmd_entrypoint_core | Главное отличие CMD и ENTRYPOINT | 2.0 | core_plus | TL;DR ITLead — replaceable vs fixed |
| 1 | docker_run_override | Поведение при docker run с аргументами | 1.5 | core_plus | trailing args vs --entrypoint |
| 2 | entrypoint_cmd_combo | Паттерн ENTRYPOINT + CMD | 1.5 | basic | CLI с дефолтными аргументами |
| 3 | usage_patterns | Четыре типовых паттерна | 1.0 | basic | service / CLI / combo / shell form |
| 4 | exec_vs_shell_form | Exec form vs shell form | 2.0 | core_plus | PID 1, сигналы, production |
| 5 | common_mistakes | Типичные ошибки | 1.5 | basic | env vars, дубликаты, docker run sh |
| 6 | entrypoint_script | Паттерн docker-entrypoint.sh | 0.5 | mention | postgres-style wrapper + exec "$@" |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
