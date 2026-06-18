# Pipes в Angular

- **topic_code:** `pipes_in_angular`
- **source:** https://itlead.org/interview-questions/angular/pipes-in-angular
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/pipes-in-angular.bank.json` → `pnpm seed:topic -- pipes_in_angular`
- **status:** ready

## Вопрос

> Что такое pipes в Angular и как создавать встроенные и пользовательские pipes?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | pipe_definition | Назначение pipe | 2.0 | core_plus | TL;DR — transform(), только display, цепочка \| |
| 1 | builtin_pipes | Встроенные pipes | 1.5 | core_plus | date, currency, number, uppercase, slice, json |
| 2 | custom_pipes | Пользовательские pipes | 1.5 | intermediate | @Pipe, PipeTransform, параметры через : |
| 3 | pure_vs_impure | Pure vs impure | 2.0 | intermediate | reference change vs каждый CD, performance |
| 4 | async_pipe | AsyncPipe | 1.5 | core_plus | Observable/Promise, auto unsubscribe |
| 5 | common_mistakes | Типичные ошибки | 1.5 | intermediate | impure misuse, mutate, registration, chain order |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |
