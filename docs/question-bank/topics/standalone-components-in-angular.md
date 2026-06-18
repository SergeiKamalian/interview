# Standalone-компоненты в Angular

- **topic_code:** `standalone_components_angular`
- **source:** https://itlead.org/interview-questions/angular/standalone-components-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/standalone-components-in-angular.bank.json` → `pnpm seed:topic -- standalone_components_angular`
- **status:** ready

## Вопрос

> Что такое standalone-компоненты в Angular и чем они отличаются от модульного подхода с NgModule?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | standalone_definition | Суть standalone-компонента | 1.5 | core_plus | standalone: true + imports, без NgModule |
| 1 | ngmodule_vs_standalone | NgModule vs standalone | 1.5 | core_plus | declarations vs imports, меньше файлов |
| 2 | bootstrap_application | bootstrapApplication и provide* | 1.0 | basic | запуск без AppModule |
| 3 | load_component_lazy | loadComponent lazy loading | 1.5 | intermediate | loadComponent vs loadChildren |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | standalone: true, declarations, bootstrap, tree-shaking |
| 5 | mixing_migration | Смешивание и миграция | 1.5 | intermediate | imports не declarations, incremental migration |
| 6 | directives_pipes_compiler | Директивы/пайпы и компилятор | 1.0 | basic | compile error, template resolution |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| ngmodule_vs_standalone | standalone_definition | 0.45 |
| common_mistakes | directives_pipes_compiler | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
