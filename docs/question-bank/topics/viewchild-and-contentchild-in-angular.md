# ViewChild и ContentChild в Angular

- **topic_code:** `viewchild_contentchild_angular`
- **source:** https://itlead.org/interview-questions/angular/viewchild-and-contentchild-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/viewchild-and-contentchild-in-angular.bank.json` → `pnpm seed:topic -- viewchild_contentchild_angular`
- **status:** ready

## Вопрос

> Что такое `@ViewChild` и `@ContentChild` в Angular и в чём между ними разница?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | viewchild_contentchild_basics | ViewChild vs ContentChild | 1.5 | core_plus | ядро: свой шаблон vs ng-content |
| 1 | lifecycle_timing | Тайминг lifecycle | 1.5 | core_plus | ngAfterViewInit vs ngAfterContentInit |
| 2 | when_to_use_queries | Когда какой query | 1.0 | basic | use cases, Input vs query |
| 3 | viewchildren_querylist | ViewChildren и QueryList | 1.5 | intermediate | множественные элементы, changes |
| 4 | static_and_read_options | static и read | 1.5 | intermediate | разрешение запросов, директивы |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | ngOnInit, wrong decorator, ExpressionChanged |
| 6 | signal_queries_angular17 | Signal queries (17+) | 1.0 | basic | viewChild(), contentChild() |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| viewchild_contentchild_basics | common_mistakes | 0.40 |
| lifecycle_timing | common_mistakes | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
