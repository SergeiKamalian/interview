# Как проверить метаданные Docker-образа?

- **topic_code:** `inspect_docker_image_metadata`
- **source:** https://itlead.org/interview-questions/docker/inspect-docker-image-metadata
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/inspect-docker-image-metadata.bank.json` → `pnpm seed:topic -- inspect_docker_image_metadata`
- **status:** draft

## Вопрос

> Как проверить метаданные Docker-образа?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | inspect_tools_overview | Основные инструменты inspect | 2.0 | core_plus | TL;DR ITLead — inspect, history, manifest, dive |
| 1 | docker_inspect_fields | Поля docker inspect и --format | 2.0 | core_plus | Config, Size, Architecture, RootFS.Layers |
| 2 | docker_history_layers | docker history и слои | 1.5 | basic | --no-trunc, `<missing>`, размер слоёв |
| 3 | manifest_inspect | docker manifest inspect | 1.0 | basic | multi-arch, registry без pull |
| 4 | common_mistakes | Типичные ошибки | 1.5 | intermediate | image vs container, pull, history ≠ файлы |
| 5 | useful_patterns | Практические паттерны | 1.5 | basic | Cmd/User/Env, biggest layer, Id vs RepoDigest |
| 6 | dive_tool | Инструмент dive | 0.5 | mention | интерактивный просмотр файлов в слоях |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
