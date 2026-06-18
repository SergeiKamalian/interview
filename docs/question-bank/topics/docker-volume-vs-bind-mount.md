# Docker volume vs bind mount

- **topic_code:** `docker_volume_vs_bind_mount`
- **source:** https://itlead.org/interview-questions/docker/docker-volume-vs-bind-mount
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/docker-volume-vs-bind-mount.bank.json` → `pnpm seed:topic -- docker_volume_vs_bind_mount`
- **status:** draft

## Вопрос

> Чем отличается Docker volume от bind mount и когда что использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | volume_vs_bind_core | Определения volume и bind mount | 2.0 | core_plus | TL;DR: named volume vs host path, один флаг `-v` |
| 1 | storage_lifecycle_portability | Хранение, lifecycle, портативность | 1.5 | basic | `/var/lib/docker/volumes`, Docker vs host, перенос между хостами |
| 2 | when_to_use | Когда volume, когда bind mount | 2.0 | core_plus | prod state vs dev live-reload, config injection |
| 3 | first_mount_behavior | Первое монтирование с контентом image | 1.5 | intermediate | volume копирует из image; bind затеняет |
| 4 | common_mistakes | Типичные ошибки | 2.0 | core_plus | UID mismatch, auto-create path, Mac/Win sync, bind вместо volume |
| 5 | dev_compose_pattern | Dev compose: код + state | 1.0 | basic | bind src, volume node_modules и pgdata |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
