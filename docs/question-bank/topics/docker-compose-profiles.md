# Docker Compose profiles

- **topic_code:** `docker_compose_profiles`
- **source:** https://itlead.org/interview-questions/docker/docker-compose-profiles
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-compose-profiles.bank.json` → `pnpm seed:topic -- docker_compose_profiles`
- **status:** draft

## Вопрос

> Что такое Docker Compose profiles и как их использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | profiles_definition | Что такое profiles | 1.5 | core_plus | opt-in сервисы, один compose.yaml вместо нескольких файлов |
| 1 | activation_methods | Активация профилей | 1.0 | basic | `--profile`, `COMPOSE_PROFILES`, несколько профилей сразу |
| 2 | selection_rules | Правила отбора сервисов | 1.5 | core_plus | always-active vs profiled, несколько профилей на сервис, auto-activate по имени |
| 3 | depends_on_constraints | profiles и depends_on | 2.0 | intermediate | always-active не может зависеть от неактивного profiled-сервиса |
| 4 | practical_patterns | Практические паттерны | 1.0 | basic | debug-инструменты, migrate run, CI через env |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | depends_on, down без profile, profiles vs override |
| 6 | profiles_limitations | Ограничения и альтернативы | 1.0 | basic | build/ps/watch, когда нужны несколько compose-файлов |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| depends_on_constraints | common_mistakes | 0.40 |
| selection_rules | profiles_definition | 0.45 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
