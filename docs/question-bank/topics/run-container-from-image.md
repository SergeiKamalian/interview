# Запуск контейнера из образа

- **topic_code:** `run_container_from_image`
- **source:** https://itlead.org/interview-questions/docker/run-container-from-image
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/run-container-from-image.bank.json` → `pnpm seed:topic -- run_container_from_image`
- **status:** draft

## Вопрос

> Как запустить контейнер из Docker образа?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | docker_run_anatomy | Знает анатомию docker run | 2 | core_plus | TL;DR anatomy |
| 1 | six_flags | Знает шесть ключевых флагов | 2 | core_plus | Six flags daily use |
| 2 | port_volume_env | Правильно использует -p -v -e | 2 | basic | Port volume env |
| 3 | cmd_override | Понимает override CMD и ENTRYPOINT | 2 | basic | CMD ENTRYPOINT override |
| 4 | common_mistakes | Знает типичные ошибки | 2 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
