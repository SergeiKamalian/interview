# Signals в Angular

- **topic_code:** `signals_angular`
- **source:** https://itlead.org/interview-questions/angular/signals-in-angular
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/signals-in-angular.bank.json` → `pnpm seed:topic -- signals_angular`
- **status:** ready

## Вопрос

> Что такое Signals в Angular и как они работают?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | signal_primitives | Три примитива Signals | 1.5 | core_plus | signal(), computed(), effect() — ядро TL;DR |
| 1 | signals_vs_zone | Signals vs Zone.js | 2.0 | intermediate | fine-grained graph vs full tree scan, 2–10x |
| 2 | signals_vs_observables | Signals vs Observables | 1.5 | intermediate | таблица ITLead, toSignal/toObservable |
| 3 | reactive_graph | Граф зависимостей и scheduler | 1.5 | core_plus | set/update, microtask, кеш computed |
| 4 | common_mistakes | Типичные ошибки | 2.0 | intermediate | (), constructor, update, мутация массива, stale closure |
| 5 | when_to_use | Когда использовать Signals | 1.0 | basic | local/service/computed vs HTTP RxJS |
| 6 | computed_effect_input | computed, effect, input signals | 0.5 | mention | onCleanup, input.required, lazy recalc |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
