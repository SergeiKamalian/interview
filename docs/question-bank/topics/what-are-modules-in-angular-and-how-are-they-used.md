# Модули Angular (NgModule)

- **topic_code:** `what_are_modules_angular_how_are_they_used`
- **source:** https://itlead.org/interview-questions/angular/what-are-modules-in-angular-and-how-are-they-used
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-are-modules-in-angular-and-how-are-they-used.bank.json` → `pnpm seed:topic -- what_are_modules_angular_how_are_they_used`
- **status:** ready

## Вопрос

> Что такое модули в Angular и как они используются?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ngmodule_definition | Назначение NgModule | 1.5 | core_plus | контейнер, AppModule, eager/lazy |
| 1 | five_fields | Пять полей @NgModule | 2.0 | core_plus | declarations/imports/exports — главная ловушка |
| 2 | module_types | Типы модулей | 1.0 | basic | App/Feature/Shared/Core/Lazy |
| 3 | lazy_loading | Lazy loading | 1.5 | intermediate | loadChildren, chunk, child injector |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | BrowserModule, forRoot, double declare |
| 5 | standalone_components | Standalone | 1.0 | basic | Angular 14+, bootstrapApplication |
| 6 | core_shared_pattern | Core/Shared паттерн | 1.0 | basic | Material, NgRx, production split |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| five_fields | ngmodule_definition | 0.45 |
| common_mistakes | five_fields | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
