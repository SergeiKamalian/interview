# Docker volume и персистентность данных

- **topic_code:** `what_is_docker_volume`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-volume
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-volume.bank.json` → `pnpm seed:topic -- what_is_docker_volume`
- **status:** draft

## Вопрос

> Что такое Docker volume и зачем он нужен?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | volume_definition | Понимает что такое Docker volume | 2.0 | core_plus | TL;DR — volume vs replaceable container |
| 1 | writable_layer_vs_volume | Отличает writable layer от volume mount | 1.5 | core_plus | copy-on-write vs volume intercept |
| 2 | volume_lifecycle | Знает команды lifecycle volume | 1.0 | basic | create/ls/inspect/rm/prune |
| 3 | mount_syntax | Понимает -v vs --mount | 1.0 | basic | mount syntax ITLead |
| 4 | common_mistakes | Знает типичные ошибки с volumes | 2.0 | intermediate | data loss bugs |
| 5 | real_world_usage | Применяет volumes в реальных сценариях | 1.5 | intermediate | prod DB, Compose, bind mount dev |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
