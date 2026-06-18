# Change Detection в Angular

- **topic_code:** `how_does_change_detection_work_angular`
- **source:** https://itlead.org/interview-questions/angular/how-does-change-detection-work-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/how-does-change-detection-work-in-angular.bank.json` → `pnpm seed:topic -- how_does_change_detection_work_angular`
- **status:** ready

## Вопрос

> Как работает change detection в Angular?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | cd_definition_cycle | Цикл CD | 1.5 | core_plus | определение, tree walk, DOM sync |
| 1 | zone_js_tick | Zone.js и tick() | 2.0 | intermediate | патчи async API, ApplicationRef.tick |
| 2 | default_vs_onpush | Default vs OnPush | 2.0 | core_plus | skip subtree, trackBy, 80% меньше checks |
| 3 | reference_equality | Сравнение по ссылке | 1.5 | intermediate | ===, immutable updates для OnPush |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | мутация @Input, detach, функции в template |
| 5 | async_pipe_cdr | async pipe и CDR | 1.0 | basic | markForCheck, subscribe vs async pipe |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
