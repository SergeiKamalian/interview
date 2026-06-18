# Clustered и non-clustered индексы

- **topic_code:** `shcho_take_clustered_i_non_clustered_indeksy`
- **source:** https://itlead.org/interview-questions/general/shcho-take-clustered-i-non-clustered-indeksy
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-clustered-i-non-clustered-indeksy.bank.json` → `pnpm seed:topic -- shcho_take_clustered_i_non_clustered_indeksy`
- **status:** draft

## Вопрос

> Что такое clustered и non-clustered индексы и чем они отличаются?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | clustered_nonclustered_definition | Понимает определение clustered vs non-clustered | 1.5 | core_plus | ядро TL;DR — физический порядок vs отдельное дерево |
| 1 | one_clustered_limit | Знает лимит одного clustered и роль PRIMARY KEY | 1.5 | core_plus | follow-up: почему только один clustered |
| 2 | range_scan_vs_lookup | Сравнивает range scan clustered и bookmark lookup | 2 | intermediate | Key difference — range scan vs bookmark lookup из ITLead |
| 3 | when_to_use_index_type | Выбирает тип индекса по паттерну запросов | 1 | basic | When to use из ITLead Theory |
| 4 | covering_index_elimination | Понимает покрывающий индекс и устранение bookmark lookup | 1.5 | intermediate | Senior trap: SELECT * через narrow index |
| 5 | index_common_mistakes | Знает типичные ошибки индексирования | 2 | intermediate | Common mistakes — частая senior ловушка |
| 6 | fragmentation_senior | Диагностирует фрагментацию и проектирует индексы на fact table | 0.5 | advanced | Senior follow-up: 1B row fact table |

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
