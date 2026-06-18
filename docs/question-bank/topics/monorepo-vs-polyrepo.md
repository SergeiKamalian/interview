# Monorepo vs Polyrepo

- **topic_code:** `monorepo_vs_polyrepo`
- **source:** https://itlead.org/interview-questions/architecture/monorepo-vs-polyrepo
- **level:** middle
- **difficulty:** intermediate
- **interview_weight:** 5
- **question max_score:** 10.00
- **seed:** `backend/seeds/topics/monorepo-vs-polyrepo.bank.json` → `pnpm seed:topic -- monorepo_vs_polyrepo`
- **status:** draft

## Вопрос

> Monorepo vs polyrepo — плюсы и минусы?

## Checkpoints

| sort | checkpoint_key | title | weight | tier | rationale |
|------|----------------|-------|--------|------|-----------|
| 0 | monorepo_polyrepo_definitions | Определения monorepo и polyrepo | 1.5 | core_plus | ядро — один Git vs отдельные репо |
| 1 | shared_lib_coordination | Координация изменений shared-библиотек | 1.5 | core_plus | atomic commit vs publish cycle, version drift |
| 2 | when_to_choose | Когда выбирать monorepo / polyrepo | 1.5 | intermediate | shared code vs team autonomy из ITLead |
| 3 | build_tools_affected | Инструменты сборки и affected builds | 2.0 | intermediate | Nx/Turborepo/Bazel, граф, remote cache |
| 4 | common_mistakes | Типичные ошибки обеих моделей | 2.0 | intermediate | full CI, CODEOWNERS myth, versioning, migration |
| 5 | comparison_tradeoffs | Сравнение по ключевым аспектам | 1.0 | basic | таблица ITLead: sharing, CI, access, size |
| 6 | polyrepo_sharing_alternatives | Шеринг кода в polyrepo | 0.5 | mention | npm registry, semver, submodules — follow-up |

**Σ weight = 10.00**

## Transitive implied floors

| Source (strong) | Target | Floor fraction |
|-----------------|--------|----------------|
| shared_lib_coordination | monorepo_polyrepo_definitions | 0.45 |
| common_mistakes | build_tools_affected | 0.40 |

## QA profiles (browser)

| profile | ожидание /10 | hire |
|---------|--------------|------|
| bad | 0 – 2 | strong_reject |
| casual strong | 5 – 7 | maybe / invite |
| formal strong | 7 – 9 | invite / strong_invite |

## QA log

| date | interview | attempts | bad | casual | formal | notes |
|------|-----------|----------|-----|--------|--------|-------|
