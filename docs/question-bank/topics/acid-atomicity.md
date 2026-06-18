# ACID — атомарность

- **topic_code:** `acid_atomicity`
- **source:** https://itlead.org/interview-questions/general/acid-atomicity
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/acid-atomicity.bank.json` → `pnpm seed:topic -- acid_atomicity`
- **status:** draft

## Вопрос

> Что такое атомарность (atomicity) в ACID?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | atomicity_definition | Понимает atomicity | 1.5 | core_plus | TL;DR atomicity |
| 1 | transaction_basics | Знает BEGIN/COMMIT/ROLLBACK | 2 | core_plus | bank transfer example |
| 2 | wal_internals | Понимает WAL и rollback | 1.5 | intermediate | internals |
| 3 | when_to_use | Знает когда нужна транзакция | 1.5 | intermediate | when to use |
| 4 | common_mistakes | Знает типичные ошибки | 2 | intermediate | mistakes |
| 5 | distributed_atomicity | Понимает atomicity в распределённых системах | 1 | advanced | distributed |
| 6 | deadlock_handling | Знает deadlocks | 0.5 | mention | deadlock |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / reject |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
