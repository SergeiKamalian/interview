# Продвинутые паттерны Dependency Injection в Angular

- **topic_code:** `dependency_injection_patterns_angular`
- **source:** https://itlead.org/interview-questions/angular/dependency-injection-patterns-in-angular
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/dependency-injection-patterns-in-angular.bank.json` → `pnpm seed:topic -- dependency_injection_patterns_angular`
- **status:** ready

## Вопрос

> Какие продвинутые паттерны Dependency Injection используются в Angular помимо базовой регистрации сервисов?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | di_injector_hierarchy | Иерархия инжекторов | 1.5 | core_plus | дерево Injector, поиск вверх, shadow |
| 1 | multi_providers | Multi-providers | 2.0 | intermediate | HTTP_INTERCEPTORS, silent overwrite |
| 2 | factory_providers | useFactory vs useClass | 1.5 | core_plus | resolution time, PLATFORM_ID |
| 3 | injection_decorators | @Self / @SkipSelf / @Optional | 1.5 | intermediate | scope поиска |
| 4 | abstract_class_token | Abstract class как token | 1.0 | basic | interface erase at compile |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | multi, inject context, lazy |
| 6 | injector_scoping | Scope экземпляров | 0.5 | basic | route override senior Q |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| multi_providers | common_mistakes | 0.45 |
| common_mistakes | multi_providers | 0.40 |
| common_mistakes | factory_providers | 0.35 |
| factory_providers | di_injector_hierarchy | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
