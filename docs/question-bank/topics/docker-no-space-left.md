# No space left on device в Docker

- **topic_code:** `docker_no_space_left`
- **source:** https://itlead.org/interview-questions/docker/docker-no-space-left
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-no-space-left.bank.json` → `pnpm seed:topic -- docker_no_space_left`
- **status:** draft

## Вопрос

> Как исправить ошибку «no space left on device» на Docker-хосте?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | diagnosis_first | Диагностика перед очисткой | 1.5 | core_plus | docker system df, du — понять куда ушло место |
| 1 | space_sources | Источники расхода диска | 1.0 | basic | overlay2, volumes, logs, build cache |
| 2 | prune_commands | Команды prune и флаги | 2.0 | intermediate | targeted vs -af --volumes, -a на image prune |
| 3 | container_logs | Логи контейнеров | 2.0 | intermediate | json-file без лимита, truncate, daemon.json |
| 4 | common_mistakes | Типичные ошибки | 1.5 | intermediate | --volumes в prod, забыть -a, игнор логов |
| 5 | long_term_hygiene | Долгосрочная гигиена | 1.0 | basic | rotation, отдельный partition, cron |
| 6 | when_prune_insufficient | Когда prune не помогает | 1.0 | basic | inodes, open handles, active volume, /tmp при build |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| prune_commands | diagnosis_first | 0.45 |
| common_mistakes | prune_commands | 0.40 |
| container_logs | space_sources | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
