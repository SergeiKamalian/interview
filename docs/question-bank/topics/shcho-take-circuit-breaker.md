# Circuit Breaker

- **topic_code:** `shcho_take_circuit_breaker`
- **source:** https://itlead.org/interview-questions/architecture/shcho-take-circuit-breaker
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-circuit-breaker.bank.json` → `pnpm seed:topic -- shcho_take_circuit_breaker`
- **status:** draft

## Вопрос

> Что такое circuit breaker и как он защищает распределённую систему?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | circuit_breaker_definition | Определение и назначение | 1.5 | core_plus | ядро — паттерн защиты от каскадных сбоев удалённой зависимости |
| 1 | three_states | Три состояния и переходы | 1.5 | core_plus | Closed / Open / Half-Open — ключевая модель из ITLead |
| 2 | breaker_vs_retry | Отличие от retry | 1.0 | intermediate | retry усиливает нагрузку; breaker режет трафик |
| 3 | failure_tracking | Скользящее окно и пороги | 1.5 | intermediate | RingBitSet, errorThresholdPercentage, volumeThreshold |
| 4 | when_to_use | Когда применять | 1.0 | basic | remote API/microservice vs in-process; breaker на зависимость |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | volumeThreshold, fallback, global breaker, resetTimeout |
| 6 | distributed_half_open | Распределённый Half-Open | 1.5 | intermediate | thundering herd, Redis, Istio/Envoy outlier_detection |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| three_states | circuit_breaker_definition | 0.45 |
| common_mistakes | failure_tracking | 0.40 |
| distributed_half_open | three_states | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
