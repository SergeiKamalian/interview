# Иерархия инжекторов в Angular

- **topic_code:** `injector_hierarchy_angular`
- **source:** https://itlead.org/interview-questions/angular/injector-hierarchy-in-angular
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/injector-hierarchy-in-angular.bank.json` → `pnpm seed:topic -- injector_hierarchy_angular`
- **status:** ready

## Вопрос

> Как устроена иерархия инжекторов в Angular и как Angular резолвит зависимости?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | injector_tree_definition | Дерево инжекторов и walk-up | 1.5 | core_plus | org chart, NullInjectorError, shadow |
| 1 | four_injector_levels | Четыре уровня инжекторов | 1.5 | core_plus | root/module/component/element, decision rule |
| 2 | resolution_and_caching | records map и getAt() | 1.0 | basic | singleton per injector, caching |
| 3 | shadowing_and_inheritance | Shadowing и наследование | 1.5 | intermediate | MockUserService, parent SharedService |
| 4 | lazy_module_injectors | Lazy module injectors | 2.0 | intermediate | child injector, shadow root, e2e mock |
| 5 | self_skipself_optional | @Self / @SkipSelf / @Optional | 1.5 | intermediate | LoggerService recursive, TreeService |
| 6 | common_mistakes | Ошибки и viewProviders | 1.0 | intermediate | ng-content, library root, double provider |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| four_injector_levels | injector_tree_definition | 0.45 |
| shadowing_and_inheritance | common_mistakes | 0.40 |
| lazy_module_injectors | common_mistakes | 0.45 |
| common_mistakes | lazy_module_injectors | 0.40 |
| common_mistakes | shadowing_and_inheritance | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
