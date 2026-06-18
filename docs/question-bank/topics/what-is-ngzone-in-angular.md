# NgZone в Angular

- **topic_code:** `what_is_ngzone_angular`
- **source:** https://itlead.org/interview-questions/angular/what-is-ngzone-in-angular
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/what-is-ngzone-in-angular.bank.json` → `pnpm seed:topic -- what_is_ngzone_angular`
- **status:** ready

## Вопрос

> Что такое NgZone в Angular и как он связан с change detection?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | ngzone_definition | Определение NgZone | 1.5 | core_plus | обёртка Zone.js, автоматический CD внутри зоны |
| 1 | zone_internal_mechanism | Внутренний механизм Zone.js | 2.0 | intermediate | патчи API, NgZoneImpl, tick через microtask |
| 2 | run_outside_vs_run | runOutsideAngular vs run() | 1.5 | core_plus | выход/возврат в зону, quick example ITLead |
| 3 | common_mistakes | Типичные ошибки NgZone | 2.0 | intermediate | WebSocket, UI вне зоны, интервалы, nested run |
| 4 | when_to_use | Когда использовать | 0.5 | basic | анимации, third-party, SSR isInAngularZone |
| 5 | real_world_patterns | Паттерны в production | 1.0 | basic | NgbModal, PrimeNG, Material, RxJS tap+run |
| 6 | zoneless_signals | Zoneless и signals | 1.0 | basic | Angular 17+, мост между моделями |
| 7 | onpush_async_debug | OnPush, async pipe, отладка | 0.5 | mention | markForCheck vs zone, ng.probe debug |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 8 – 9.5 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
