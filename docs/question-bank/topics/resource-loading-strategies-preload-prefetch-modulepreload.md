# Preload, prefetch, modulepreload

- **topic_code:** `resource_loading_strategies_preload_prefetch_modulepreload`
- **source:** https://itlead.org/interview-questions/general/resource-loading-strategies-preload-prefetch-modulepreload
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/resource-loading-strategies-preload-prefetch-modulepreload.bank.json` → `pnpm seed:topic -- resource_loading_strategies_preload_prefetch_modulepreload`
- **status:** ready

## Вопрос

> Чем отличаются preload, prefetch и modulepreload и когда их использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | preload_basics | Понимает preload | 1.5 | core_plus | preload TL;DR |
| 1 | prefetch_basics | Понимает prefetch | 1.5 | core_plus | prefetch section |
| 2 | modulepreload_basics | Понимает modulepreload | 1.5 | core_plus | modulepreload section |
| 3 | comparison_when_use | Сравнивает три стратегии | 2 | intermediate | comparison table |
| 4 | common_mistakes | Знает типичные ошибки hints | 2 | intermediate | common mistakes |
| 5 | internals_priority | Понимает приоритеты браузера | 1.5 | basic | how browser handles |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
