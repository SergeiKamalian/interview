# Уменьшение размера Docker образа

- **topic_code:** `reduce_docker_image_size`
- **source:** https://itlead.org/interview-questions/docker/reduce-docker-image-size
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/reduce-docker-image-size.bank.json` → `pnpm seed:topic -- reduce_docker_image_size`
- **status:** draft

## Вопрос

> Как уменьшить размер Docker образа?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | five_techniques | Называет пять ключевых техник | 2 | core_plus | TL;DR five techniques |
| 1 | multistage_build | Понимает multi-stage build | 2 | core_plus | Multi-stage biggest win |
| 2 | base_image_choice | Выбирает base image | 1.5 | intermediate | Base image options |
| 3 | run_cleanup_layers | Объединяет RUN и чистит cache | 1.5 | intermediate | Single RUN cleanup |
| 4 | dockerignore | Знает .dockerignore | 1.5 | intermediate | dockerignore |
| 5 | common_mistakes | Знает типичные ошибки | 1.5 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
