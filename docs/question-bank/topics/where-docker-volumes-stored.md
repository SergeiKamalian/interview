# Где хранятся Docker volumes

- **topic_code:** `where_docker_volumes_stored`
- **source:** https://itlead.org/interview-questions/docker/where-docker-volumes-stored
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/where-docker-volumes-stored.bank.json` → `pnpm seed:topic -- where_docker_volumes_stored`
- **status:** draft

## Вопрос

> Где на хосте хранятся Docker volumes?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | linux_path | Путь на Linux | 2.0 | core_plus | /var/lib/docker/volumes/_data |
| 1 | mac_windows_vm | Mac/Windows VM | 2.0 | intermediate | Docker Desktop VM isolation |
| 2 | volume_inspect | volume inspect | 1.5 | basic | Mountpoint cross-platform |
| 3 | data_root_config | data-root | 1.5 | intermediate | daemon.json, anatomy |
| 4 | backup_restore | Backup/migration | 1.5 | intermediate | tar via container |
| 5 | common_mistakes | Типичные ошибки | 1.5 | intermediate | edit live, rm -rf |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
