# Template-driven и reactive forms в Angular

- **topic_code:** `difference_between_template_driven_reactive_forms_angular`
- **source:** https://itlead.org/interview-questions/angular/difference-between-template-driven-and-reactive-forms-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/difference-between-template-driven-and-reactive-forms-in-angular.bank.json` → `pnpm seed:topic -- difference_between_template_driven_reactive_forms_angular`
- **status:** ready

## Вопрос

> В чём разница между template-driven и reactive forms в Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | template_driven_basics | Template-driven basics | 1.5 | core_plus | FormsModule, ngModel, NgForm, name |
| 1 | reactive_basics | Reactive basics | 1.5 | core_plus | FormGroup, FormControl, formControlName |
| 2 | key_difference_data_flow | Поток данных | 2.0 | intermediate | ngModel vs valueChanges — key difference |
| 3 | when_to_use | Выбор подхода | 1.5 | basic | статичные vs динамические сценарии |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | ngModel+formControlName, patchValue, subscribe |
| 5 | reactive_apis_testing | Reactive API и тесты | 1.5 | core_plus | setValue/patchValue, addControl, async validators |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
