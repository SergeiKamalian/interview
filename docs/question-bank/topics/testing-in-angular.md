# Тестирование в Angular

- **topic_code:** `testing_angular`
- **source:** https://itlead.org/interview-questions/angular/testing-in-angular
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/testing-in-angular.bank.json` → `pnpm seed:topic -- testing_angular`
- **status:** ready

## Вопрос

> Как организовано тестирование в Angular: unit- и integration-тесты, TestBed и работа с HTTP?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | unit_vs_integration | Unit vs integration | 1.5 | core_plus | TL;DR, comparison table, оба слоя |
| 1 | testbed_fixture | TestBed и ComponentFixture | 1.5 | core_plus | test harness, manual detectChanges |
| 2 | http_testing | HttpTestingController | 2.0 | intermediate | expectOne, flush, verify — integration |
| 3 | common_mistakes | Типичные ошибки | 2.0 | intermediate | detectChanges, behavior, over-mock, verify |
| 4 | when_to_use_each | Когда unit / integration / E2E | 1.0 | basic | when to use each из ITLead |
| 5 | async_timing | fakeAsync и tick | 1.0 | intermediate | debounce CI stability, OnPush |
| 6 | senior_debug_dom | «Тест проходит, DOM пуст» | 1.0 | intermediate | senior follow-up Q |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| testbed_fixture | unit_vs_integration | 0.45 |
| http_testing | common_mistakes | 0.40 |
| common_mistakes | async_timing | 0.40 |
| common_mistakes | http_testing | 0.35 |
| senior_debug_dom | testbed_fixture | 0.45 |
| senior_debug_dom | async_timing | 0.40 |

## Senior evaluation hints

- **unit_vs_integration**, **testbed_fixture**: `probePolicy`, `confusionPairs`, `probeConceptGroups`
- **http_testing**, **common_mistakes**: `falseClaimCapFraction: 0`, `probeConceptGroups`
- **async_timing**: OnPush + fakeAsync follow-up probes
- **senior_debug_dom**: implied floors на testbed + async; senior-debug checklist из ITLead Q

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
