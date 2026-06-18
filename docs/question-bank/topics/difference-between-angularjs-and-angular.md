# Разница между AngularJS и Angular

- **topic_code:** `difference_between_angularjs_angular`
- **source:** https://itlead.org/interview-questions/angular/difference-between-angularjs-and-angular
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/difference-between-angularjs-and-angular.bank.json` → `pnpm seed:topic -- difference_between_angularjs_angular`
- **status:** ready

## Вопрос

> В чём разница между AngularJS и Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | not_same_framework | Angular — не апгрейд AngularJS | 2.0 | core_plus | TL;DR — rewrite 2016, EOL 2021 |
| 1 | scope_vs_component | $scope vs компонент | 2.0 | core_plus | Quick example — модель данных |
| 2 | language_architecture | Язык и архитектура | 1.0 | basic | JS/MVC vs TS/components/CLI |
| 3 | digest_vs_zone | Digest vs Zone.js | 2.0 | intermediate | Key difference — change detection |
| 4 | when_to_use | Когда что использовать | 1.5 | basic | legacy vs new, ngUpgrade |
| 5 | common_mistakes | Типичные ошибки | 1.5 | basic | $apply, CommonModule, ngModel |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
