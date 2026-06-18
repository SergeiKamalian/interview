# Обмен данными между контейнерами

- **topic_code:** `share_data_between_containers`
- **source:** https://itlead.org/interview-questions/docker/share-data-between-containers
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/share-data-between-containers.bank.json` → `pnpm seed:topic -- share_data_between_containers`
- **status:** draft

## Вопрос

> Как делиться данными между Docker контейнерами?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | three_patterns | Различает три паттерна обмена данными | 2 | core_plus | TL;DR three patterns |
| 1 | shared_volume | Знает shared named volume | 1.5 | core_plus | Pattern 1 named volume |
| 2 | network_rpc | Предпочитает network для service-to-service | 1.5 | intermediate | Pattern 2 network RPC |
| 3 | message_queue | Знает message queue паттерн | 1.5 | intermediate | Pattern 3 message queue |
| 4 | concurrent_access | Понимает concurrent access pitfalls | 1.5 | intermediate | Concurrent access |
| 5 | common_mistakes | Знает типичные ошибки | 2 | basic | Common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
