# Noisy tenants

- **topic_code:** `shcho_take_noisy_tenants`
- **source:** https://itlead.org/interview-questions/general/shcho-take-noisy-tenants
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-noisy-tenants.bank.json` → `pnpm seed:topic -- shcho_take_noisy_tenants`
- **status:** draft

## Вопрос

> Что такое noisy tenants и как защитить multi-tenant систему от них?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | noisy_tenant_definition | Понимает определение noisy tenant | 1.5 | core_plus | ядро TL;DR noisy tenants |
| 1 | shared_vs_isolated | Отличает shared multi-tenant от isolated single-tenant | 1.5 | core_plus | system design problem из ITLead |
| 2 | mitigation_strategies | Знает стратегии mitigation | 2 | intermediate | When to use each strategy |
| 3 | infrastructure_level | Понимает механизмы на уровне инфраструктуры | 1.5 | intermediate | How it works at infrastructure level |
| 4 | detection_monitoring | Умеет обнаруживать noisy tenants | 1 | basic | Follow-up detection |
| 5 | noisy_common_mistakes | Знает типичные ошибки | 1.5 | intermediate | Common mistakes |
| 6 | senior_quota_architecture | Проектирует quota system для thousands tenants | 1 | advanced | Senior follow-up 10k tenants 99.99% SLO |

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
