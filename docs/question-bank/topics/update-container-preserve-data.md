# Обновление контейнера без потери данных

- **topic_code:** `update_container_preserve_data`
- **source:** https://itlead.org/interview-questions/docker/update-container-preserve-data
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/update-container-preserve-data.bank.json` → `pnpm seed:topic -- update_container_preserve_data`
- **status:** draft

## Вопрос

> Как обновить Docker-контейнер без потери данных?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | update_pattern | Базовый паттерн обновления | 2 | intermediate | simple update pattern ITLead |
| 1 | volumes_survive | Volumes переживают контейнер | 2 | intermediate | state in volumes not container |
| 2 | compose_update | Обновление через Compose | 1.5 | core_plus | compose cleaner workflow |
| 3 | what_survives_table | Что сохраняется при rm | 1.5 | core_plus | survival table ITLead |
| 4 | db_version_caveat | Major upgrade БД | 2 | intermediate | DB version bump caveat |
| 5 | zero_downtime | Zero-downtime опции | 1 | basic | zero downtime section |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
