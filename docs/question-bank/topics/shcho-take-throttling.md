# Throttling

- **topic_code:** `shcho_take_throttling`
- **source:** https://itlead.org/interview-questions/general/shcho-take-throttling
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-throttling.bank.json` → `pnpm seed:topic -- shcho_take_throttling`
- **status:** draft

## Вопрос

> Что такое throttling и когда его использовать вместо debounce?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | throttle_definition | Понимает определение throttling | 1.5 | core_plus | ядро TL;DR throttling |
| 1 | throttle_vs_debounce | Отличает throttle от debounce | 1.5 | core_plus | Throttle vs debounce — key decision rule |
| 2 | throttle_implementation | Реализует throttle через closure | 1.5 | intermediate | Internal mechanism timestamp vs timeout |
| 3 | leading_trailing_edges | Знает leading и trailing edge | 1.5 | intermediate | Leading and trailing edges section |
| 4 | throttle_use_cases | Называет практические use cases | 1 | basic | When to use throttle |
| 5 | throttle_common_mistakes | Знает типичные ошибки throttle | 2 | intermediate | Common mistakes |
| 6 | distributed_token_bucket | Понимает distributed throttle и token bucket | 1 | advanced | Senior distributed throttle follow-up |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
