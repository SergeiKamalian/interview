# HttpClient и interceptors в Angular

- **topic_code:** `httpclient_interceptors_angular`
- **source:** https://itlead.org/interview-questions/angular/httpclient-and-interceptors-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/httpclient-and-interceptors-in-angular.bank.json` → `pnpm seed:topic -- httpclient_interceptors_angular`
- **status:** ready

## Вопрос

> Как работают HttpClient и interceptors в Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | httpclient_basics | HttpClient и Observable | 1.5 | core_plus | typed RxJS API, JSON, unsubscribe |
| 1 | interceptor_role | HttpClient vs interceptor | 1.5 | core_plus | per-call vs global middleware |
| 2 | interceptor_chain | Цепочка interceptors | 2.0 | intermediate | next(), reverse, short-circuit |
| 3 | immutable_clone | Immutable HttpRequest | 1.0 | basic | clone(), setHeaders |
| 4 | functional_interceptors | Функциональные interceptors | 1.0 | basic | HttpInterceptorFn, withInterceptors |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | return next, swallow error, retry 401 |
| 6 | when_to_use | Когда использовать | 1.0 | basic | auth, cache, logging, skip header |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
