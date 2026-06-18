# Композитные индексы

- **topic_code:** `shcho_take_kompozytni_indeksy`
- **source:** https://itlead.org/interview-questions/general/shcho-take-kompozytni-indeksy
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-kompozytni-indeksy.bank.json` → `pnpm seed:topic -- shcho_take_kompozytni_indeksy`
- **status:** draft

## Вопрос

> Что такое композитные индексы и как работает правило левого префикса?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | composite_definition | Понимает определение композитного индекса | 1.5 | core_plus | ядро TL;DR composite index |
| 1 | leftmost_prefix | Знает правило левого префикса | 2 | intermediate | leftmost prefix — центральная senior тема |
| 2 | column_ordering | Правильно упорядочивает колонки | 1.5 | intermediate | Column ordering из ITLead |
| 3 | covering_composite | Отличает covering index от composite | 1.5 | core_plus | Covering indexes section |
| 4 | composite_mistakes | Знает типичные ошибки композитных индексов | 2 | intermediate | Common mistakes — частая prod и interview ошибка |
| 5 | planner_explain | Понимает выбор планировщика и EXPLAIN | 1 | basic | Follow-up questions planner |
| 6 | real_world_composite | Приводит практические паттерны composite index | 0.5 | mention | Real-world usage из ITLead |

**Σ weight = 10.00**

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 6 – 8 | invite / maybe |
| formal strong | 8 – 9.5 | strong_invite / invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
