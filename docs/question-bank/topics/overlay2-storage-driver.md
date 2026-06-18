# overlay2 storage driver

- **topic_code:** `overlay2_storage_driver`
- **source:** https://itlead.org/interview-questions/docker/overlay2-storage-driver
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/overlay2-storage-driver.bank.json` → `pnpm seed:topic -- overlay2_storage_driver`
- **status:** draft

## Вопрос

> Что такое overlay2 storage driver и когда его менять?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | overlay2_definition | Определяет overlay2 и OverlayFS | 2 | core_plus | TL;DR overlay2 |
| 1 | overlayfs_mechanism | Описывает lowerdir/upperdir/merged | 1.5 | core_plus | How OverlayFS works |
| 2 | cow_performance | Понимает copy-on-write и производительность | 1.5 | intermediate | COW performance |
| 3 | when_to_change | Знает когда менять driver | 1.5 | intermediate | When to change driver |
| 4 | check_and_disk | Проверяет driver и disk usage | 1 | basic | Check and disk space |
| 5 | switch_procedure | Знает процедуру смены driver | 1 | basic | Switching driver procedure |
| 6 | common_mistakes | Знает типичные ошибки | 1 | basic | Common mistakes |
| 7 | metacopy | Понимает metacopy (упоминание) | 0.5 | mention | metacopy follow-up |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
