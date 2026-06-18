# Методы жизненного цикла компонентов в Angular

- **topic_code:** `component_lifecycle_methods_angular`
- **source:** https://itlead.org/interview-questions/angular/component-lifecycle-methods-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/component-lifecycle-methods-in-angular.bank.json` → `pnpm seed:topic -- component_lifecycle_methods_angular`
- **status:** ready

## Вопрос

> Какие методы жизненного цикла (lifecycle hooks) есть в Angular и когда их использовать?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | lifecycle_hooks_basics | Lifecycle hooks | 1.0 | basic | определение, OnInit/OnDestroy |
| 1 | hook_execution_order | Порядок хуков | 1.5 | core_plus | ngOnChanges → … → ngOnDestroy, parent/child |
| 2 | constructor_vs_ngoninit | Constructor vs ngOnInit | 2.0 | intermediate | DI vs @Input, fetch в ngOnInit |
| 3 | ngonchanges_simplechanges | ngOnChanges | 1.5 | core_plus | SimpleChanges, firstChange |
| 4 | view_and_content_hooks | View/content хуки | 1.5 | intermediate | ViewChild, ng-content |
| 5 | ngondestroy_cleanup | ngOnDestroy | 1.5 | core_plus | takeUntil, memory leaks |
| 6 | common_mistakes | Ошибки и ngDoCheck | 1.0 | basic | OnPush mutations, last resort |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| constructor_vs_ngoninit | common_mistakes | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## Примечание перед seed

В `question-bank.seed.sql` пока нет skill `angular`. Перед `pnpm seed:topic` добавь:

```sql
INSERT INTO skills (code, name) VALUES ('angular', 'Angular')
ON DUPLICATE KEY UPDATE name = VALUES(name);
```
