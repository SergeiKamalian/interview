# RxJS операторы в Angular

- **topic_code:** `common_rxjs_operators_angular`
- **source:** https://itlead.org/interview-questions/angular/common-rxjs-operators-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/common-rxjs-operators-in-angular.bank.json` → `pnpm seed:topic -- common_rxjs_operators_angular`
- **status:** ready

## Вопрос

> Какие RxJS операторы чаще всего используются в Angular и когда применять каждый?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | operators_pipe_basics | pipe и неизменяемость | 1.0 | basic | pipe(), чистые функции |
| 1 | map_filter_transform | map и filter | 1.0 | basic | трансформация vs фильтрация |
| 2 | flattening_operators | switchMap / mergeMap / concatMap | 2.0 | intermediate | ядро middle interview |
| 3 | debounce_search | debounceTime и type-ahead | 1.5 | core_plus | autocomplete паттерн |
| 4 | combine_forkjoin | combineLatest и forkJoin | 1.0 | basic | комбинирование потоков |
| 5 | catcherror_inner | catchError внутри inner | 2.0 | intermediate | изоляция ошибок |
| 6 | common_mistakes | ошибки и takeUntil | 1.5 | core_plus | nested subscribe, leaks |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| debounce_search | flattening_operators | 0.45 |
| catcherror_inner | common_mistakes | 0.40 |

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
