# Декораторы @Input и @Output в Angular

- **topic_code:** `input_output_decorators_angular`
- **source:** https://itlead.org/interview-questions/angular/input-output-decorators-in-angular
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/input-output-decorators-in-angular.bank.json` → `pnpm seed:topic -- input_output_decorators_angular`
- **status:** ready

## Вопрос

> Как работают декораторы @Input и @Output в Angular и как ими связывают родительский и дочерний компоненты?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | input_output_definition | Роли @Input и @Output | 2.0 | core_plus | TL;DR — parent→child, child→parent, EventEmitter |
| 1 | template_parent_child_syntax | Синтаксис в шаблоне | 2.0 | intermediate | [prop] и (event), $event |
| 2 | two_way_binding_pattern | value / valueChange | 1.5 | core_plus | counter, [(value)], source of truth |
| 3 | common_mistakes | Типичные ошибки | 2.0 | intermediate | скобки, mutate, EventEmitter, booleanAttribute |
| 4 | when_to_use | Input/Output vs сервис | 1.5 | basic | карточка, delete, BehaviorSubject, prop drilling |
| 5 | input_advanced_options | required, alias, OnPush | 1.0 | basic | NG0303, transform, reference change |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
