# RxJS и интеграция в Angular

- **topic_code:** `what_is_rxjs_how_is_it_integrated_angular`
- **source:** https://itlead.org/interview-questions/angular/what-is-rxjs-and-how-is-it-integrated-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-rxjs-and-how-is-it-integrated-in-angular.bank.json` → `pnpm seed:topic -- what_is_rxjs_how_is_it_integrated_angular`
- **status:** ready

## Вопрос

> Что такое RxJS и как он интегрирован в Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | rxjs_observable_basics | Observable, subscribe и lazy execution | 1.0 | basic | TL;DR и quick example ITLead |
| 1 | promise_vs_observable | Observable vs Promise | 1.5 | core_plus | ключевая разница и правило выбора |
| 2 | angular_rxjs_integration | RxJS в Angular API | 2.0 | intermediate | HttpClient, Router, Forms, async pipe |
| 3 | cold_vs_hot | Cold vs hot Observables | 1.5 | core_plus | HttpClient cold, Subject hot, shareReplay |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | leaks, .then, двойной subscribe, errors |
| 5 | cleanup_patterns | async pipe и takeUntilDestroyed | 1.5 | core_plus | Angular 16+ очистка подписок |
| 6 | when_to_use | Когда RxJS vs Promise | 0.5 | mention | decision rule из ITLead |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| angular_rxjs_integration | rxjs_observable_basics | 0.45 |
| common_mistakes | cleanup_patterns | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
