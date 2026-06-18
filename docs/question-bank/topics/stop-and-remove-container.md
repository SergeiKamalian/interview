# Остановка и удаление контейнера

- **topic_code:** `stop_remove_container`
- **source:** https://itlead.org/interview-questions/docker/stop-and-remove-container
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/stop-and-remove-container.bank.json` → `pnpm seed:topic -- stop_remove_container`
- **status:** draft

## Вопрос

> Как остановить и удалить Docker контейнер?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | stop_vs_rm | Различает stop и rm | 2 | core_plus | stop vs rm core |
| 1 | stop_kill_rm_f | Знает stop, kill, rm -f | 2 | core_plus | stop kill rm -f |
| 2 | volume_rm_flag | Понимает rm -v и named volumes | 2 | basic | Volume cleanup -v |
| 3 | bulk_prune_rm | Знает bulk cleanup и --rm | 2 | basic | Bulk and --rm |
| 4 | common_mistakes | Знает типичные ошибки | 2 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
