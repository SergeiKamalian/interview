# Referential actions в SQL

- **topic_code:** `shcho_take_referential_actions_v_sql`
- **source:** https://itlead.org/interview-questions/general/shcho-take-referential-actions-v-sql
- **level:** junior
- **difficulty:** basic
- **interview_weight:** 2
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/shcho-take-referential-actions-v-sql.bank.json` → `pnpm seed:topic -- shcho_take_referential_actions_v_sql`
- **status:** draft

## Вопрос

> Что такое referential actions в SQL и какие типы бывают?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | referential_actions_definition | Понимает определение referential actions | 1.5 | core_plus | ядро определения из TL;DR |
| 1 | five_action_types | Знает пять типов действий | 2 | intermediate | The five actions — центральный junior блок |
| 2 | when_to_use_actions | Выбирает action по бизнес-смыслу данных | 1.5 | basic | When to use из ITLead |
| 3 | cascade_depth_trap | Понимает глубину CASCADE | 1 | basic | Common mistake CASCADE depth |
| 4 | referential_mistakes | Знает типичные ошибки | 2 | intermediate | Common mistakes |
| 5 | restrict_vs_no_action | Отличает RESTRICT от NO ACTION | 1 | basic | Follow-up RESTRICT vs NO ACTION |
| 6 | internal_mechanism | Понимает внутренний механизм enforcement | 1 | mention | How it works internally |

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
