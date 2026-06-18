# Atomic Design — архитектура UI

- **topic_code:** `atomic_design_architecture`
- **source:** https://itlead.org/interview-questions/architecture/atomic-design-architecture
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/atomic-design-architecture.bank.json` → `pnpm seed:topic -- atomic_design_architecture`
- **status:** ready

## Вопрос

> Что такое Atomic Design и как устроены пять уровней абстракции UI-компонентов?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | five_levels | Пять уровней Atomic Design | 2.0 | core_plus | ядро — atoms → pages из ITLead TL;DR |
| 1 | bottom_up_approach | Bottom-up vs component library | 1.5 | core_plus | validated parts, меньше drift |
| 2 | level_distinctions | Molecule/organism и template/page | 2.0 | intermediate | follow-up Q&A из ITLead |
| 3 | when_to_use | Когда применять и когда пропустить | 1.0 | basic | solo vs 5+ devs, 50+ components |
| 4 | process_methodology | Процесс, Storybook, без runtime | 1.0 | basic | файловая структура, изоляция |
| 5 | common_mistakes | Типичные ошибки Atomic Design | 1.5 | intermediate | styling, fetch, templates, over-atomize |
| 6 | scale_and_migration | Масштабирование и миграция legacy | 1.0 | basic | reuse ratio, bottom-up refactor |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| level_distinctions | five_levels | 0.45 |
| common_mistakes | process_methodology | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
