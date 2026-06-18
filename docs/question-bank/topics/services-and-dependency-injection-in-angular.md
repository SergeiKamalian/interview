# Сервисы и dependency injection в Angular

- **topic_code:** `services_dependency_injection_angular`
- **source:** https://itlead.org/interview-questions/angular/services-and-dependency-injection-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/services-and-dependency-injection-in-angular.bank.json` → `pnpm seed:topic -- services_dependency_injection_angular`
- **status:** ready

## Вопрос

> Что такое сервисы в Angular и как работает dependency injection?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | service_and_di_basics | Сервис и суть DI | 1.5 | core_plus | @Injectable, shared logic, no new, testability |
| 1 | injector_tree_basics | Дерево инжекторов и резолюция | 1.5 | core_plus | walk-up, root/module/component, providedIn root |
| 2 | providing_services | Три способа регистрации | 2.0 | intermediate | root singleton, component scope, InjectionToken |
| 3 | provider_types | Типы провайдеров | 1.5 | intermediate | useClass/useValue/useFactory/useExisting |
| 4 | inject_function | Функция inject() | 1.0 | basic | field initializer, standalone style |
| 5 | common_mistakes | Типичные ошибки DI | 2.0 | intermediate | NullInjectorError, new, circular, scoping |
| 6 | di_testing | Моки в TestBed | 0.5 | basic | useValue mock, TestBed.inject |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| providing_services | injector_tree_basics | 0.40 |
| provider_types | providing_services | 0.35 |
| common_mistakes | providing_services | 0.40 |
| common_mistakes | injector_tree_basics | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
