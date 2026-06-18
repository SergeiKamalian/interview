# Feature-Sliced Design (FSD)

- **topic_code:** `feature_sliced_design_fsd_must_know_frontend_architecture`
- **source:** https://itlead.org/interview-questions/architecture/feature-sliced-design-fsd-must-know-frontend-architecture
- **level:** senior
- **difficulty:** advanced
- **interview_weight:** 7
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/feature-sliced-design-fsd-must-know-frontend-architecture.bank.json` → `pnpm seed:topic -- feature_sliced_design_fsd_must_know_frontend_architecture`
- **status:** ready

## Вопрос

> Что такое Feature-Sliced Design (FSD) и как устроена архитектура фронтенда по этой методологии?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | fsd_layers | Пять слоёв FSD | 1.5 | core_plus | app/pages/features/entities/shared — ядро методологии |
| 1 | domain_colocation | Группировка по домену | 1.5 | core_plus | co-location vs by-type, одна фича — один каталог |
| 2 | dependency_rules | Правила зависимостей | 2.0 | intermediate | только снизу вверх, изоляция slices одного слоя |
| 3 | when_to_use | Когда применять FSD | 1.0 | basic | команда 5+, e-commerce/SaaS vs прототип <1000 LOC |
| 4 | enforcement_tooling | ESLint и public API | 1.0 | basic | eslint-plugin-feature-sliced, barrel index.ts |
| 5 | common_mistakes | Типичные ошибки | 2.0 | intermediate | shared-свалка, cross-feature, upward import |
| 6 | state_migration_patterns | Состояние, миграция, Atomic Design | 1.0 | basic | Zustand в model/, callback вместо router в feature |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| domain_colocation | fsd_layers | 0.45 |
| dependency_rules | common_mistakes | 0.40 |
| common_mistakes | dependency_rules | 0.35 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual | 4 – 6 | reject / maybe |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
