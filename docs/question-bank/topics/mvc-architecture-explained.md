# Паттерн MVC

- **topic_code:** `mvc_architecture_explained`
- **source:** https://itlead.org/interview-questions/architecture/mvc-architecture-explained
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/mvc-architecture-explained.bank.json` → `pnpm seed:topic -- mvc_architecture_explained`
- **status:** ready

## Вопрос

> Что такое архитектурный паттерн MVC и как связаны Model, View и Controller?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | mvc_components | Знает роли Model, View, Controller | 1.5 | core_plus | три компонента — ядро TL;DR |
| 1 | mvc_data_flow | Понимает поток данных MVC | 1.5 | core_plus | View не вызывает Model напрямую |
| 2 | layer_separation | Понимает разделение ответственности | 1.0 | basic | separation of concerns из quick example |
| 3 | when_to_use | Знает когда применять MVC | 1.0 | basic | when to use / skip из ITLead |
| 4 | common_mistakes | Знает типичные ошибки MVC | 2.0 | intermediate | View fetch, fat Controller, stale View |
| 5 | mvc_vs_alternatives | Сравнивает MVC с альтернативами | 1.5 | intermediate | MVC vs Flux/Redux vs MVVM |
| 6 | runtime_and_frameworks | Знает runtime и фреймворки MVC | 1.5 | basic | browser/Rails/REST, real-world |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| mvc_data_flow | mvc_components | 0.45 |
| common_mistakes | mvc_data_flow | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
