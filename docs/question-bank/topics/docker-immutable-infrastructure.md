# Immutable infrastructure с Docker

- **topic_code:** `docker_immutable_infrastructure`
- **source:** https://itlead.org/interview-questions/docker/docker-immutable-infrastructure
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-immutable-infrastructure.bank.json` → `pnpm seed:topic -- docker_immutable_infrastructure`
- **status:** draft

## Вопрос

> Что такое immutable infrastructure и как Docker помогает её реализовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | immutable_definition | Immutable vs mutable | 1.5 | core_plus | ядро — замена instance, не patch in-place |
| 1 | docker_immutable_model | Модель Docker: image и redeploy | 1.5 | core_plus | image = артефакт, container = disposable instance |
| 2 | externalized_state | Внешнее состояние | 2.0 | intermediate | DB, secrets, logs вне контейнера |
| 3 | benefits_rollback | Преимущества и rollback | 2.0 | intermediate | reproducibility, audit, deploy старого tag |
| 4 | deployment_patterns | Blue-green, canary, rolling | 1.0 | basic | паттерны замены идентичных реплик |
| 5 | anti_patterns_mistakes | Антипаттерны и типичные ошибки | 2.0 | intermediate | docker exec, config в image, latest, volumes |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| docker_immutable_model | immutable_definition | 0.45 |
| anti_patterns_mistakes | externalized_state | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
