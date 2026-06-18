# Привязка данных в Angular

- **topic_code:** `data_binding_angular`
- **source:** https://itlead.org/interview-questions/angular/data-binding-in-angular
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/data-binding-in-angular.bank.json` → `pnpm seed:topic -- data_binding_angular`
- **status:** ready

## Вопрос

> Что такое data binding в Angular и какие типы привязки данных существуют?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | four_binding_types | Четыре типа binding | 2.0 | core_plus | TL;DR — интерполяция, property, event, ngModel |
| 1 | interpolation_vs_property | Интерполяция vs property | 2.0 | intermediate | [src] vs {{ }}, [disabled], [attr.*] |
| 2 | event_binding | Event binding | 1.0 | basic | (click), $event |
| 3 | two_way_ngmodel | [(ngModel)] и FormsModule | 1.5 | core_plus | banana in a box, form controls |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | методы в шаблоне, FormsModule, ngModel на div |
| 5 | when_to_use | Когда что использовать | 1.5 | basic | таблица when to use, unidirectional flow |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
