# Что такое Docker Compose

- **topic_code:** `what_is_docker_compose`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-compose
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-compose.bank.json` → `pnpm seed:topic -- what_is_docker_compose`
- **status:** draft

## Вопрос

> Что такое Docker Compose?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | compose_definition | Определяет Compose | 1.5 | core_plus | TL;DR compose |
| 1 | compose_yaml_blocks | Блоки compose файла | 1 | basic | main blocks |
| 2 | service_dns | DNS между сервисами | 2 | intermediate | embedded DNS — частая ошибка |
| 3 | lifecycle_commands | Команды lifecycle | 1 | basic | lifecycle commands |
| 4 | common_mistakes | Типичные ошибки Compose | 2 | intermediate | common mistakes ITLead |
| 5 | v1_vs_v2 | Compose v1 vs v2 | 1 | basic | 2026 standard |
| 6 | when_not_enough | Когда Compose недостаточен | 1.5 | core_plus | scope limits |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
