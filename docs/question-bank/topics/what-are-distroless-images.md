# Distroless-образы

- **topic_code:** `what_are_distroless_images`
- **source:** https://itlead.org/interview-questions/docker/what-are-distroless-images
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-are-distroless-images.bank.json` → `pnpm seed:topic -- what_are_distroless_images`
- **status:** draft

## Вопрос

> Что такое distroless-образы и какие преимущества они дают?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | distroless_definition | Определяет distroless | 1.5 | core_plus | distribution-less TL;DR |
| 1 | no_shell_security | Без shell — безопасность | 2 | intermediate | security core benefit |
| 2 | variants_multistage | Варианты и multi-stage | 1.5 | core_plus | variants table + dockerfile pattern |
| 3 | size_benefits | Размер и CVE | 1 | basic | size benefit ITLead |
| 4 | debug_tradeoff | Trade-off отладки | 2 | intermediate | debugging trade-off |
| 5 | alpine_comparison | Distroless vs Alpine | 1 | basic | comparison table |
| 6 | common_mistakes | Типичные ошибки | 1 | basic | curl healthcheck mistake |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
