# Push и pull образов на Docker Hub

- **topic_code:** `docker_hub_push_pull_images`
- **source:** https://itlead.org/interview-questions/docker/docker-hub-push-pull-images
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-hub-push-pull-images.bank.json` → `pnpm seed:topic -- docker_hub_push_pull_images`
- **status:** draft

## Вопрос

> Как загрузить (push) и скачать (pull) Docker-образы на Docker Hub?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | basic_workflow | login / tag / push / pull | 2.0 | core_plus | ядро TL;DR — четыре команды |
| 1 | image_naming | Формат имени и tagging | 1.5 | basic | namespace/repo:tag, library |
| 2 | pat_authentication | PAT вместо пароля | 1.5 | basic | scope, revoke, CI secrets |
| 3 | credentials_storage | Хранение credentials | 1.0 | basic | config.json, credential helper |
| 4 | common_mistakes | Типичные ошибки | 2.5 | intermediate | namespace, latest-only, rate limit |
| 5 | ci_and_real_world | CI и real-world | 1.5 | basic | GitHub Actions, SHA-tag |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
