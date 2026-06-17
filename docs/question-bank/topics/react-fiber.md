# React Fiber & Virtual DOM update process

- **topic_code:** `react_fiber`
- **source:** https://itlead.org/interview-questions/react/react-fiber-and-virtual-dom-update-process
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 8
- **question max_score:** 10.00 (target; legacy seed may show 8.00 — normalize to 10 in next pass)
- **seed:** `backend/seeds/question-bank.seed.sql` (+ `fiber-evaluation-hints.seed.sql`)
- **status:** seeded

## Почему senior

Тема про reconciliation engine, render/commit phases, scheduler, lanes — ожидается от **senior** frontend, не от middle.

## Вопрос

> Как работает React Fiber и процесс обновления Virtual DOM?

## Checkpoints (ориентир)

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | fiber_definition | Что такое Fiber | 1.5 | core_plus | ядро senior-ответа |
| 1 | stack_vs_fiber | Stack vs Fiber | 1.5 | core_plus | отличие от React 15 |
| 2 | fiber_pointers | Структура fiber-узла | 1.0 | basic | child/sibling/return |
| 3 | render_phase | Render phase | 1.0 | basic | DOM не трогается |
| 4 | commit_phase | Commit phase | 1.0 | basic | синхронная запись в DOM |
| 5 | scheduling | Планирование / scheduler | 2.5 | advanced | MessageChannel, не rIC |
| 6 | lanes_priority | Lanes / приоритеты | 1.5 | core_plus | Sync vs Transition |
| 7 | commit_limitation | Ограничения Fiber | 1.0 | basic | commit не разбивается |

**Σ weight = 10.00**

## interview_weight = 8

Ключевая тема для senior React-интервью: сильно влияет на `finalScore`, но не единственная (не 10).

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 1.5 | strong_reject |
| casual (поверхностно) | 3 – 5 | reject / maybe |
| formal strong | 7 – 9.5 | invite / strong_invite |
