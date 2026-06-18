# Docker Content Trust (DCT)

- **topic_code:** `what_is_docker_content_trust`
- **source:** https://itlead.org/interview-questions/docker/what-is-docker-content-trust
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-docker-content-trust.bank.json` → `pnpm seed:topic -- what_is_docker_content_trust`
- **status:** draft

## Вопрос

> Что такое Docker Content Trust (DCT)?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | dct_definition | Определяет DCT | 1.5 | core_plus | TL;DR DCT |
| 1 | how_dct_works | Как работает DCT | 2 | intermediate | how DCT works flow |
| 2 | trust_keys_notary | Ключи и Notary | 1.5 | core_plus | push keys section |
| 3 | cosign_migration | DCT vs Cosign/Sigstore | 2 | intermediate | why moved cosign |
| 4 | tuf_brief | TUF модель | 1 | basic | TUF concept brief |
| 5 | common_mistakes | Типичные ошибки DCT | 2 | intermediate | common mistakes |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
