# Angular Router: маршрутизация, guards и lazy loading

- **topic_code:** `angular_router_lazy_loading`
- **source:** https://itlead.org/interview-questions/angular/angular-router-and-lazy-loading
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/angular-router-and-lazy-loading.bank.json` → `pnpm seed:topic -- angular_router_lazy_loading`
- **status:** ready

## Вопрос

> Как работает Angular Router: маршрутизация, guards и lazy loading?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | router_basics | Основы Router | 1.0 | basic | Routes, routerLink, router-outlet |
| 1 | lazy_loading | Lazy vs eager | 1.5 | core_plus | loadComponent vs loadChildren, first paint |
| 2 | guards_overview | Типы guards | 1.5 | core_plus | canActivate, canDeactivate, functional |
| 3 | canmatch_lazy | canMatch на lazy | 2.0 | intermediate | ключ ITLead — блок до скачивания чанка |
| 4 | route_params | Snapshot vs observable | 1.5 | intermediate | re-navigation /users/:id |
| 5 | common_mistakes | Типичные ошибки | 1.5 | intermediate | pathMatch full, wildcard, canActivate на lazy |
| 6 | nested_resolvers | Вложенные маршруты и resolvers | 1.0 | basic | children, trade-off resolver vs skeleton |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| common_mistakes | route_params | 0.40 |
| common_mistakes | canmatch_lazy | 0.35 |

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
